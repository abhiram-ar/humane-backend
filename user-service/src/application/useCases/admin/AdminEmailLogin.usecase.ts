import { ENV } from '@config/env';
import { PasswordError } from '@application/errors/PasswordError';
import { IHashService } from '@ports/IHashService';
import { IJWTService } from '@ports/IJWTService';
import { AdminJWTTokenPaylod } from '@application/types/JWTTokenPayload.type';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS, JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { EmailError } from '@application/errors/EmailError';
import { IAdminRepository } from '@ports/IAdminRepository';
import { adminLoginDTO } from '@dtos/admin/adminLogin.dto';
import { IAdminEmailLogin } from '@ports/usecases/admin/IAdminEmailLogin';

export class AdminEmailLogin implements IAdminEmailLogin {
   constructor(
      private readonly _AdminRepository: IAdminRepository,
      private readonly _hasingService: IHashService,
      private readonly _jwtService: IJWTService
   ) {}

   execute = async (dto: adminLoginDTO): Promise<{ accessToken: string; refreshToken: string }> => {
      const admin = await this._AdminRepository.retriveAdminByEmail(dto.email);
      if (!admin) {
         throw new EmailError('Email does not exist');
      }

      if (!admin.passwordHash) {
         throw new PasswordError('Account has no password');
      }

      const passwordMatch = await this._hasingService.compare(dto.password, admin.passwordHash);
      if (!passwordMatch) {
         throw new PasswordError('password does not match');
      }

      // create JWT
      const jwtTokenPaylod: AdminJWTTokenPaylod = {
         adminId: admin.id,
         type: 'admin',
      };

      const accessToken = this._jwtService.sign(
         jwtTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      const refreshToken = this._jwtService.sign(
         jwtTokenPaylod,
         ENV.REFRESH_TOKEN_SECRET as string,
         JWT_REFRESH_TOKEN_EXPIRY_SECONDS
      );

      return { accessToken, refreshToken };
   };
}
