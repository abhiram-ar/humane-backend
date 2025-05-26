import { ENV } from '@config/env';
import { Client, errors } from '@elastic/elasticsearch';
import { CreateUserDTO } from 'dto/createUser.dto';
import { IUserRepository } from 'repository/Interfaces/IUserRepository';
import { ES_INDEXES } from './ES_INDEXES';
import { UserDocument } from './UserDocument.type';
import { UpdateUserDTO } from '@dtos/updateUser.dto';
import { logger } from '@config/logger';

export class UserRepository implements IUserRepository {
   public readonly client;
   private readonly _index = ES_INDEXES.USER_PROFILE_INDEX;
   constructor() {
      this.client = new Client({ node: ENV.ELASTICSEARCH_URI });
   }

   initializeUserIndex = async () => {
      const indexExists = await this.client.indices.exists({
         index: ES_INDEXES.USER_PROFILE_INDEX,
      });
      if (!indexExists)
         await this.client.indices.create({
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
         const health = await this.client.cluster.health();
         console.log('cluster health', health);
      } catch (error) {
         console.log('error pingitg es cluster', error);
      }
   };

   createCommand = async (dto: CreateUserDTO): Promise<void> => {
      const { id, ...data } = dto;
      await this.client.index({
         index: ES_INDEXES.USER_PROFILE_INDEX,
         id: dto.id,
         document: { ...data, updatedAt: dto.createdAt },
      });
   };
   updatedAtQuery = async (id: string): Promise<{ updatedAt: string | undefined } | null> => {
      const res = await this.client.get<Pick<UserDocument, 'updatedAt'>>({
         index: this._index,
         id,
         _source: ['updatedAt'],
      });
      if (!res.found) return null;

      return { updatedAt: res._source?.updatedAt };
   };

   updateCommand = async (updatedAt: string, dto: UpdateUserDTO): Promise<void> => {
      const { id, ...data } = dto;

      await this.client.update({
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
      await this.client.update({
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
      await this.client.update({
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
      this.client.update({
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
      type Query = NonNullable<Parameters<typeof this.client.search>[0]>['query'];

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

      const res = await this.client.search<UserDocument>({
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
      const res = await this.client.search<UserDocument>({
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
         const res = await this.client.get<UserDocument>({ index: this._index, id: userId });

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
}
