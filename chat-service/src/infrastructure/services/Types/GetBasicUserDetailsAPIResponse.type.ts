import { BasicUserDetails } from '@application/Types/BasicUserDetails.type';

export type GetUserBasicDetailsResponse = {
   success: boolean;
   message: string;
   data: {
      user: (BasicUserDetails | null)[];
   };
};
