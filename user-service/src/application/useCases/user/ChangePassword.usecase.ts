import { PasswordError } from '@application/errors/PasswordError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { ENV } from '@config/env';
import { ChangePasswordInputDTO } from '@application/DTO-mapper/user/ChangePassword.dto';
import { IHashService } from '@ports/IHashService';
import { IUserRepository } from '@ports/IUserRepository';
import { IChangePassword } from '@ports/usecases/user/ChangePassword.usecase';

export class ChangePassword implements IChangePassword {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _hashService: IHashService
   ) {}

   execute = async (dto: ChangePasswordInputDTO) => {
      const user = await this._userRepository.retriveUserById(dto.userId);
      if (!user) throw new UserNotFoundError();

      if (!user.passwordHash)
         throw new PasswordError('Account does not have a passsword. Try reseting password');

      const isOldPasswordMatch = await this._hashService.compare(dto.password, user.passwordHash);
      if (!isOldPasswordMatch) throw new PasswordError('Wrong Password');

      const hashedPassword = await this._hashService.hash(
         dto.newPassword,
         parseInt(ENV.PASSWORD_SALT as string)
      );

      await this._userRepository.changePassword(user.email, hashedPassword);

      return { success: true };
   };
}
