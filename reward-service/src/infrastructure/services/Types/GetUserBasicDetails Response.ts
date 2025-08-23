import { BasicUserDetails } from '@application/types/BasicUserDetails';

export type GetUserBasicDetailsResponse = {
   success: boolean;
   message: string;
   data: {
      user: (BasicUserDetails | null)[];
   };
};
