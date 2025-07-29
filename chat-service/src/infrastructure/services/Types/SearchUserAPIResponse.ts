import { SearchUserData } from '@application/Types/ESSearchUser.type';

export type SearchUserAPIResponse = {
   status: number;
   message: string;
   data: SearchUserData;
};
