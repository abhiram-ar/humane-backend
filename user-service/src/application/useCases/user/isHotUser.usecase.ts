import { IUserRepository } from '@ports/IUserRepository';
import { IIsHotUser } from '@ports/usecases/user/IIsHotUser.usecase';

export class IsHotUser implements IIsHotUser {
   constructor(private readonly _userRepo: IUserRepository) {}

   execute = async (userId: string): Promise<boolean | null> => {
      return await this._userRepo.isHotUser(userId);
   };
}
