import { ENV } from '@config/env';
import { Client } from '@elastic/elasticsearch';
import { CreateUserDTO } from 'dto/createUser.dto';
import { IUserRepository } from 'repository/Interfaces/IUserRepository';
import { ES_INDEXES } from './ES_INDEXES';
import { UserDocument } from './UserDocument.type';
import { UpdateUserDTO } from '@dtos/updateUser.dto';

export class UserRepository implements IUserRepository {
   private readonly _client;
   private readonly _index = ES_INDEXES.USER_PROFILE_INDEX;
   constructor() {
      this._client = new Client({ node: ENV.ELASTICSEARCH_URI });
   }

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

   createCommand = async (dto: CreateUserDTO): Promise<void> => {
      const { id, ...data } = dto;
      await this._client.index({
         index: ES_INDEXES.USER_PROFILE_INDEX,
         id: dto.id,
         document: { ...data, updatedAt: dto.createdAt },
      });
   };
   updatedAtQuery = async (id: string): Promise<{ updatedAt: string | undefined } | null> => {
      const res = await this._client.get<Pick<UserDocument, 'updatedAt'>>({
         index: this._index,
         id,
         _source: ['updatedAt'],
      });
      if (!res.found) return null;

      return { updatedAt: res._source?.updatedAt };
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
}
