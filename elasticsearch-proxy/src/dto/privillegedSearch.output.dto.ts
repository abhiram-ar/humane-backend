import { UserDocument } from '@repository/elasticsearch/UserDocument.type';
import { IPagination } from 'Types/Pagination.type';

export type PrivillegedUserSearchOutputDTO = {
   users: (Pick<UserDocument, 'firstName' | 'lastName' | 'createdAt' | 'humaneScore'> & {
      id: string;
   })[];
   pagination: IPagination;
};
