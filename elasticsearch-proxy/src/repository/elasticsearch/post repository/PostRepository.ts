import { IPostDocument } from 'interfaces/IPostDocument';
import { IPostRepository } from 'interfaces/repository/IPostRepository';
import { ES_INDEXES } from '../ES_INDEXES';
import { Client, errors } from '@elastic/elasticsearch';
import { PostVisibility } from 'humane-common';

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
                  posterKey: { type: 'keyword' },
                  visibility: { type: 'constant_keyword' },
                  moderationStatus: { type: 'constant_keyword' },
                  moderationMetadata: { type: 'object' },
                  createdAt: { type: 'date' }, // this is interpreated as iso data string in elastic search, covert the toISODataString() before injesting
                  updatedAt: { type: 'date' },
               },
            },
         });
   };

   create = async (post: IPostDocument): Promise<void> => {
      await this._client.index({ index: this._index, id: post.id, document: post });
   };
   deleteById = async (itemId: string): Promise<{ found: boolean; deleted: boolean }> => {
      try {
         const res = await this._client.delete({ index: this._index, id: itemId });
         console.log('del', res);
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
      console.log('f', userId === '5315c3dd-a5bc-4754-9ce7-817018f97f7d');

      const res = await this._client.search<IPostDocument>({
         index: ES_INDEXES.POST_INDEX,
         size: limit,
         query: {
            match: {
               authorId: '5315c3dd-a5bc-4754-9ce7-817018f97f7d',
            },
         },
      });

      const hits = res.hits.hits;
      console.log(res);

      const parsedPostList = hits.map((hit) => ({ ...hit._source } as IPostDocument));

      const searchAfter =
         hits.length > 0 ? (hits[hits.length - 1].sort?.[0] as string) ?? null : null;

      return { posts: parsedPostList, from: searchAfter, hasMore: hits.length === limit };
   };
   replace = async (postId: string, doc: IPostDocument): Promise<void> => {
      await this._client.update({ index: this._index, id: postId, doc });
   };
}
