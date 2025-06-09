import { Client, errors } from '@elastic/elasticsearch';
import { CreateUserDTO } from 'interfaces/dto/createUser.dto';
import { IUserRepository } from '@repository/elasticsearch/user repository/IUserRepository';
import { ES_INDEXES } from '../ES_INDEXES';
import { UserDocument } from './UserDocument.type';
import { UpdateUserDTO } from 'interfaces/dto/updateUser.dto';
import { logger } from '@config/logger';

export class UserRepository implements IUserRepository {
   private readonly _index = ES_INDEXES.USER_PROFILE_INDEX;
   constructor(public readonly _client: Client) {}

   initializeUserIndex = async () => {
      const indexExists = await this._client.indices.exists({
         index: ES_INDEXES.USER_PROFILE_INDEX,
      });
      if (!indexExists)
         await this._client.indices.create({
            index: ES_INDEXES.USER_PROFILE_INDEX,
            mappings: {
               // prevent dynamic filed creation in production, improve query performance and better resouce utilization
               dynamic: 'false',
               properties: {
                  firstName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                  lastName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                  bio: { type: 'text', index: false },
                  avatarKey: { type: 'keyword', index: false },
                  coverPhotoKey: { type: 'keyword', index: false },
                  createdAt: { type: 'date' }, // this is interpreated as iso data string in elastic search, covert the toISODataString() before injesting
                  updatedAt: { type: 'date' },
                  lastLoginTime: { type: 'date' },
                  isBlocked: { type: 'boolean' },
                  isHotUser: { type: 'boolean' },
                  humaneScore: { type: 'integer' },
               },
            },
         });
   };

   pingES = async () => {
      try {
         const health = await this._client.cluster.health();
         console.log('cluster health', health);
      } catch (error) {
         console.log('error pingitg es cluster', error);
      }
   };

   createCommand = async (dto: CreateUserDTO): Promise<void> => {
      const { id, ...data } = dto;
      await this._client.index({
         index: ES_INDEXES.USER_PROFILE_INDEX,
         id: dto.id,
         document: { ...data, updatedAt: dto.createdAt },
      });
   };
   updatedAtQuery = async (id: string): Promise<{ updatedAt: string | undefined } | null> => {
      try {
         const res = await this._client.get<Pick<UserDocument, 'updatedAt'>>({
            index: this._index,
            id,
            _source: ['updatedAt'],
         });
         if (!res.found) return null;

         return { updatedAt: res._source?.updatedAt };
      } catch (error) {
         if (error instanceof errors.ResponseError) {
            error.statusCode === 404;
            return null;
         } else {
            throw error;
         }
      }
   };

   updateCommand = async (updatedAt: string, dto: UpdateUserDTO): Promise<void> => {
      const { id, ...data } = dto;

      await this._client.update({
         index: this._index,
         id: id,
         doc: { ...data, updatedAt } as UserDocument,
      });
   };
   updateUserAvatarKeyCommand = async (
      updatedAt: string,
      docId: string,
      avatarKey: string | null
   ): Promise<void> => {
      await this._client.update({
         index: this._index,
         id: docId,
         doc: { avatarKey, updatedAt } as UserDocument,
      });
   };

   updateUserCoverPhotoKeyCommand = async (
      updatedAt: string,
      docId: string,
      coverPhotoKey: string | null
   ): Promise<void> => {
      await this._client.update({
         index: this._index,
         id: docId,
         doc: {
            coverPhotoKey,
            updatedAt,
         } as UserDocument,
      });
   };

   updateUserBlockStatusCommand = async (
      updatedAt: string,
      docId: string,
      newBlockStatus: boolean
   ): Promise<void> => {
      this._client.update({
         index: this._index,
         id: docId,
         doc: {
            isBlocked: newBlockStatus,
            updatedAt,
         } as UserDocument,
      });
   };

   paginatedSearchQuery = async (
      search: string,
      from: number,
      size: number
   ): Promise<{ users: (UserDocument & { id: string })[]; totalEntries: number }> => {
      type Query = NonNullable<Parameters<typeof this._client.search>[0]>['query'];

      const query: Query = search
         ? {
              multi_match: {
                 query: search,
                 fields: ['firstName', 'lastName'] as (keyof UserDocument)[],
                 fuzziness: 'AUTO',
              },
           }
         : {
              match_all: {},
           };

      const res = await this._client.search<UserDocument>({
         index: this._index,
         from,
         size,
         query,
         track_total_hits: true, // Without track_total_hits, elasticsearch defaults to a cap of 10,000.
      });

      const parsedUserList = res.hits.hits
         .map((hit) => ({ ...hit._source, id: hit._id }))
         .filter(
            (user): user is UserDocument & { id: string } =>
               user !== undefined && typeof user.id === 'string'
         );

      const totalEntries = (res.hits.total as { value: number }).value;

      return { users: parsedUserList, totalEntries };
   };

   infiniteScrollSearchQuery = async (
      searchQuery: string,
      sortAfter: [number] | null,
      size: number
   ): Promise<{
      users: (UserDocument & { id: string })[];
      searchAfter: [number] | null;
      hasMore: boolean;
   }> => {
      const res = await this._client.search<UserDocument>({
         index: this._index,
         size,
         sort: [{ createdAt: 'desc' }], // this changes to type of searchAfter array
         search_after: sortAfter ? sortAfter : undefined,
         query: {
            multi_match: {
               query: searchQuery,
               fields: ['firstName', 'lastName'] as (keyof UserDocument)[],
               fuzziness: 'AUTO',
            },
         },
      });

      const hits = res.hits.hits;

      const parsedUserList = hits
         .map((hit) => ({ ...hit._source, id: hit._id }))
         .filter(
            (user): user is UserDocument & { id: string } =>
               user !== undefined && typeof user.id === 'string'
         );

      const searchAfter = hits.length > 0 ? (hits[hits.length - 1].sort as [number]) : null;

      return { users: parsedUserList, searchAfter, hasMore: hits.length === size };
   };

   getUserById = async (userId: string): Promise<(UserDocument & { id: string }) | null> => {
      try {
         const res = await this._client.get<UserDocument>({ index: this._index, id: userId });

         if (!res.found || !res._source) return null;

         return { ...res._source, id: res._id };
      } catch (error) {
         logger.error(`error while retiving id:${userId} from ES`);
         if (error instanceof errors.ResponseError) {
            error.meta.statusCode === 404;
            return null;
         }
         logger.verbose(error);
         return null;
      }
   };

   getUsersById = async (
      userIds: string[]
   ): Promise<((UserDocument & { id: string }) | null)[]> => {
      const res = await this._client.mget<UserDocument>({
         index: this._index,
         ids: userIds,
         _source: true,
      });

      const parsedUserDocList = res.docs.map((doc) => {
         const typedDoc = doc as {
            _source: UserDocument;
            found: boolean;
            _id: string;
            _index: string;
         };
         return typedDoc.found ? { ...typedDoc._source, id: doc._id } : null;
      });
      return parsedUserDocList;
   };
}
