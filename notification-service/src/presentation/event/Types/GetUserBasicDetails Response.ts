import { BasicUserDetails } from '@application/Types/BasicUserDetails';

export type GetUserBasicDetailsResponse = {
   success: boolean;
   message: string;
   data: {
      user: (BasicUserDetails | null)[];
   };
};
