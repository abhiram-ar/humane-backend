import { IPostDocument } from 'interfaces/IPostDocument';
import { IPostRepository } from 'interfaces/repository/IPostRepository';
import { ES_INDEXES } from '../ES_INDEXES';
import { Client, errors } from '@elastic/elasticsearch';
import { PostVisibility } from 'humane-common';
import { logger } from '@config/logger';

export class PostRepository implements IPostRepository {
   private readonly _index = ES_INDEXES.POST_INDEX;
   constructor(public readonly _client: Client) {}

   initializePostIndex = async () => {
      const indexExists = await this._client.indices.exists({
         index: ES_INDEXES.POST_INDEX,
      });
      if (!indexExists)
         await this._client.indices.create({
            index: ES_INDEXES.POST_INDEX,
            settings: {
               number_of_replicas: 0, // 👈 Critical fix for single-node
            },
            mappings: {
               // prevent dynamic filed creation in production, improve query performance and better resouce utilization
               dynamic: 'false',
               properties: {
                  id: { type: 'keyword' },
                  authorId: { type: 'keyword' },
                  content: { type: 'text' },
                  posterKey: { type: 'keyword', index: false },
                  visibility: { type: 'keyword' },
                  moderationStatus: { type: 'keyword' },
                  moderationMetadata: { type: 'object' },
                  createdAt: { type: 'date' }, // this is interpreated as iso data string in elastic search, covert the toISODataString() before injesting
                  updatedAt: { type: 'date', index: false },
                  commentCount: { type: 'integer', index: false },
               },
            },
         });
   };

   create = async (post: IPostDocument): Promise<void> => {
      await this._client.index({
         index: this._index,
         id: post.id,
         document: { ...post, commentCount: 0 },
      });
   };
   deleteById = async (itemId: string): Promise<{ found: boolean; deleted: boolean }> => {
      try {
         const res = await this._client.delete({ index: this._index, id: itemId });
         return {
            found: res.result === 'not_found' ? false : true,
            deleted: res.result === 'deleted' ? true : false,
         };
      } catch (error) {
         if (error instanceof errors.ResponseError) {
            error.statusCode === 404;
            return { found: false, deleted: false };
         } else {
            throw error;
         }
      }
   };
   getUpdatedAt = async (postId: string): Promise<{ updatedAt: Date } | null> => {
      try {
         const res = await this._client.get<IPostDocument>({
            index: this._index,
            id: postId,
            _source: ['updatedAt'],
         });

         if (!res.found) return null;

         return { updatedAt: res._source!.updatedAt };
      } catch (error) {
         if (error instanceof errors.ResponseError) {
            error.statusCode === 404;
            return null;
         } else {
            throw error;
         }
      }
   };
   getByIds = async (postIds: string[]): Promise<(IPostDocument | null)[]> => {
      const res = await this._client.mget<IPostDocument>({
         index: this._index,
         ids: postIds,
         _source: true,
      });

      const parsedPostDocList = res.docs.map((doc) => {
         const typedDoc = doc as {
            _source: IPostDocument;
            found: boolean;
            _id: string;
            _index: string;
         };
         return typedDoc.found ? { ...typedDoc._source } : null;
      });
      return parsedPostDocList;
   };

   getUserPosts = async (
      userId: string,
      from: string | null,
      limit: number,
      filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined
   ): Promise<{ posts: IPostDocument[]; from: string | null; hasMore: boolean }> => {
      const res = await this._client.search<IPostDocument>({
         index: ES_INDEXES.POST_INDEX,
         size: limit,
         sort: [{ id: 'desc' }],
         search_after: from ? [from] : undefined,
         query: {
            bool: {
               filter: filter
                  ? [{ term: { authorId: userId } }, { term: { visibility: filter } }]
                  : [{ term: { authorId: userId } }],
            },
         },
      });

      const hits = res.hits.hits;

      const parsedPostList = hits.map((hit) => ({ ...hit._source } as IPostDocument));

      const searchAfter =
         hits.length > 0 ? (hits[hits.length - 1].sort?.[0] as string) ?? null : null;

      return { posts: parsedPostList, from: searchAfter, hasMore: hits.length === limit };
   };
   replace = async (postId: string, doc: IPostDocument): Promise<void> => {
      await this._client.update({ index: this._index, id: postId, doc });
   };

   bulkUpdateCommentsCount = async (
      updates: { postId: string; delta: number }[]
   ): Promise<{ ack: boolean }> => {
      const bulkBody: any[] = [];
      updates.forEach((update) => {
         bulkBody.push({
            update: { _index: this._index, _id: update.postId },
         });

         bulkBody.push({
            script: {
               source: `
               if(ctx._source.commentCount == null) {
                  ctx._source.commentCount = params.delta;
                  } 
               else {
                  ctx._source.commentCount += params.delta;
               }`,
               lang: 'painless',
               params: { delta: update.delta },
            },
         });
      });

      try {
         const res = await this._client.bulk({
            operations: bulkBody,
         });
         console.log(JSON.stringify(res.items, null, 2));
         return { ack: true };
      } catch (error) {
         logger.error('error while bulk updating post comments');
         console.log(error);
         return { ack: false };
      }
   };
}
