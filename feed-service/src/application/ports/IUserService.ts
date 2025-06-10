export interface IUserService {
   getAllFriendsNonHotUser(
      userId: string
   ): Promise<{ isHotUser: true } | { isHotUser: false; friends: string[] }>;
}
