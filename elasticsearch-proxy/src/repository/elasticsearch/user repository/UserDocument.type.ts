export interface IUserDocument {
   firstName: string;
   lastName?: string | null;
   bio?: string | null;
   avatarKey?: string | null;
   coverPhotoKey?: string  | null;
   createdAt: string;
   updatedAt: string;
   lastLoginTime?: string | null;
   isBlocked: boolean;
   isHotUser: boolean;
   humaneScore: number
}
