import { ENV } from '@config/env';
import { Client } from '@elastic/elasticsearch';
import { CreateUserDTO } from 'dto/createUser.dto';
import { IUserRepository } from 'repository/Interfaces/IUserRepository';
import { ES_INDEXES } from './ES_INDEXES';

export class UserRepository implements IUserRepository {
   private readonly client;
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
                  email: { type: 'keyword' },
                  avatarURL: { type: 'keyword', index: false },
                  coverPhotoURL: { type: 'keyword', index: false },
                  createdAt: { type: 'date' }, // this is interpreated as iso data string in elastic search, covert the toISODataString() before injesting
                  updatedAt: { type: 'date' },
                  lastLoginTime: { type: 'date' },
                  isBlocked: { type: 'boolean' },
                  isHotUser: { type: 'boolean' },
               },
            },
         });
   };

   create = async (dto: CreateUserDTO): Promise<{ ack: boolean }> => {
      try {
         const { id, ...data } = dto;
         await this.client.index({
            index: ES_INDEXES.USER_PROFILE_INDEX,
            id: dto.id,
            document: data,
         });
         return { ack: true };
      } catch (error) {
         console.log('error while createing user:', dto.id);
         return { ack: false };
      }
   };
}
