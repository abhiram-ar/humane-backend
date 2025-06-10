import { UserDocument } from '@repository/elasticsearch/user repository/UserDocument.type';
import { IPagination } from 'Types/Pagination.type';

export type PrivillegedUserSearchOutputDTO = {
   users: (Pick<UserDocument, 'firstName' | 'lastName'> & {
      id: string;
   })[];
   pagination: IPagination;
};
