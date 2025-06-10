import { IUserRepository } from '@ports/IUserRepository';

export class IsHotUser {
   constructor(private readonly _userRepo: IUserRepository) {}

   execute = async (userId: string): Promise<boolean | null> => {
      return await this._userRepo.isHotUser(userId);
   };
}
