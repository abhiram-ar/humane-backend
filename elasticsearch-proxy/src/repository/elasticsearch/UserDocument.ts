export interface UserDocument {
   firstName: string;
   lastName: string | undefined | null;
   bio: string | undefined | null;
   avatarURL: string | undefined | null;
   coverPhotoURL: string | undefined | null;
   createdAt: string;
   updatedAt: string;
   lastLoginTime: string | undefined | null;
   isBlocked: boolean;
   isHotUser: boolean;
}
