import { ES_INDEXES } from './ES_INDEXES';
import { esClient } from '../../config/esClient';

export const initializeUserIndex = async () => {
   const indexExists = await esClient.indices.exists({ index: ES_INDEXES.USER_PROFILE_INDEX });
   if (!indexExists)
      await esClient.indices.create({
         index: ES_INDEXES.USER_PROFILE_INDEX,
         // prevent dynamic filed creation in production, improve query performance and better resouce utilization
         mappings: {
            dynamic: 'strict',
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
