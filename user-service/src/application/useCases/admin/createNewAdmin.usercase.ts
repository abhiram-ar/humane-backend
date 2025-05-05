import { IAdminRepository } from '@ports/IAdminRepository';
import { IHashService } from '../../ports/IHashService';
import { createAdminDTO } from '@dtos/admin/createAdmin.dto';
import { signupAdminDTO } from '@dtos/admin/signupAdmin.dto';
import { ENV } from '@config/env';
import { EmailError } from '@application/errors/EmailError';

export class CreateAdmin {
   constructor(
      private readonly adminRepository: IAdminRepository,
      private readonly hashService: IHashService
   ) {}

   execute = async (
      dto: signupAdminDTO
   ): Promise<{ firstName: string; lastName?: string; email: string }> => {
      const emailExists = await this.adminRepository.emailExists(dto.email);
      if (emailExists) {
         throw new EmailError('Email already exists');
      }

      const passwordHash = await this.hashService.hash(
         dto.password,
         parseInt(ENV.PASSWORD_SALT as string)
      );

      const createAdminDTO: createAdminDTO = {
         firstName: dto.firstName,
         lastName: dto.lastName,
         email: dto.email,
         passwordHash,
      };

      const newAdmin = await this.adminRepository.create(createAdminDTO);

      if (!newAdmin) {
         throw new Error('cannot create new admin');
      }

      return { firstName: newAdmin.firstName, lastName: newAdmin.lastName, email: newAdmin.email };
   };
}
