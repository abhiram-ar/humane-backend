import { IPagination } from './IPagination';

export type UserDetailsFromES = {
   id: string;
   firstName: string;
   lastName?: string | null;
};

export type SearchUserData = {
   users: UserDetailsFromES[];
   pagination: IPagination;
};
