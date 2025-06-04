export type BasicUserDetails = {
   id: string;
   firstName: string;
   lastName?: string | null;
   avatarURL?: string | null;
};
export type GetUserBasicDetailsResponse = {
   success: boolean;
   message: string;
   data: {
      user: (BasicUserDetails | null)[];
   };
};
