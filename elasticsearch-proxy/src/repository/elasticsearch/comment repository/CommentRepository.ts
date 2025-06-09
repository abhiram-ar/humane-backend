import { ICommenetRepository } from 'interfaces/repository/ICommentRepository';
import { ES_INDEXES } from '../ES_INDEXES';
import { Client, errors } from '@elastic/elasticsearch';
import { ICommentDocument } from 'interfaces/ICommentDocument';

export class CommetRepository implements ICommenetRepository {
   private readonly _index = ES_INDEXES.COMMENT_INDEX;
   constructor(public readonly _client: Client) {}

   initializeCommentIndex = async () => {
      const indexExists = await this._client.indices.exists({
         index: ES_INDEXES.COMMENT_INDEX,
      });
      if (!indexExists)
         await this._client.indices.create({
            index: ES_INDEXES.COMMENT_INDEX,
            mappings: {
               // prevent dynamic filed creation in production, improve query performance and better resouce utilization
               dynamic: 'false',
               properties: {
                  id: { type: 'keyword' },
                  postId: { type: 'keyword' },
                  authorId: { type: 'keyword' },
                  content: { type: 'text', index: false }, // we dont want to index the comments, as it is uncecessay and create a bootleneck
                  createdAt: { type: 'date' }, // this is interpreated as iso data string in elastic search, covert the toISODataString() before injesting
                  updatedAt: { type: 'date' },
               },
            },
         });
   };

   create = async (comment: ICommentDocument): Promise<void> => {
      await this._client.index({ index: this._index, id: comment.id, document: comment });
   };

   deleteById = async (commentId: string): Promise<{ found: boolean; deleted: boolean }> => {
      try {
         const res = await this._client.delete({ index: this._index, id: commentId });
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
   getUpdatedAt = async (commentId: string): Promise<{ updatedAt: Date } | null> => {
      try {
         const res = await this._client.get<ICommentDocument>({
            index: this._index,
            id: commentId,
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
   getByIds = async (commentIds: string[]): Promise<(ICommentDocument | null)[]> => {
      const res = await this._client.mget<ICommentDocument>({
         index: this._index,
         ids: commentIds,
         _source: true,
      });

      const parsedCommentDocList = res.docs.map((doc) => {
         const typedDoc = doc as {
            _source: ICommentDocument;
            found: boolean;
            _id: string;
            _index: string;
         };
         return typedDoc.found ? { ...typedDoc._source } : null;
      });
      return parsedCommentDocList;
   };
}
