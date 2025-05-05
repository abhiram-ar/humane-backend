import { ENV } from '@config/env';
import { userLoginDTO } from '@application/DTOs/user/userLogin.dto';
import { PasswordError } from '@application/errors/PasswordError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { IHashService } from '@ports/IHashService';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { AnonJWTTokenPayload } from '@application/types/JWTTokenPayload.type';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS, JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { CreateAnonymousUser } from '../anonymous/CreateAnonymousUser.usercase';
import { EmailError } from '@application/errors/EmailError';

export class UserEmailLogin {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly hasingService: IHashService,
      private readonly jwtService: IJWTService,
      private readonly createAnonUser: CreateAnonymousUser
   ) {}

   execute = async (dto: userLoginDTO): Promise<{ accessToken: string; refreshToken: string }> => {
      const user = await this.userRepository.retriveUserByEmail(dto.email);
      if (!user) {
         throw new EmailError('Email does not exist, create an account.');
      }

      if (user.isBlocked) {
         throw new UserBlockedError('Cannot login, user is blocked');
      }

      if (!user.passwordHash) {
         throw new PasswordError(
            'Account has no password, try social Auth'
         );
      }

      const passwordMatch = await this.hasingService.compare(dto.password, user.passwordHash);
      if (!passwordMatch) {
         throw new PasswordError('password does not match');
      }

      // create anon id
      let anonUser = await this.createAnonUser.execute(user.id);

      // create JWT
      const jwtTokenPaylod: AnonJWTTokenPayload = {
         anonId: anonUser.anonId,
         createdAt: anonUser.createdAt,
         expiresAt: anonUser.expiresAt,
         revoked: anonUser.revoked,
         type: 'anon',
      };

      const accessToken = this.jwtService.sign(
         jwtTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      const refreshToken = this.jwtService.sign(
         jwtTokenPaylod,
         ENV.REFRESH_TOKEN_SECRET as string,
         JWT_REFRESH_TOKEN_EXPIRY_SECONDS
      );

      return { accessToken, refreshToken };
   };
}
