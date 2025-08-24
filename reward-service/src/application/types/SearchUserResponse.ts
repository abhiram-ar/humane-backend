import { IPagination } from './Pagination.type';

interface UserDocument {
   firstName: string;
   lastName?: string | null;
   bio?: string | null;
   avatarKey?: string | null;
   coverPhotoKey?: string | null;
   createdAt: string;
   updatedAt: string;
   lastLoginTime?: string | null;
   isBlocked: boolean;
   humaneScore: number;
}

export type SearchUserData = {
   users: (Pick<UserDocument, 'firstName' | 'lastName'> & {
      id: string;
   })[];
   pagination: IPagination;
};

export type SearchUserResponse = {
   message: string;
   data: SearchUserData;
};
