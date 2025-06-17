import { IAdminRepository } from '@ports/IAdminRepository';
import { IHashService } from '../../ports/IHashService';
import { createAdminDTO } from '@dtos/admin/createAdmin.dto';
import { signupAdminDTO } from '@dtos/admin/signupAdmin.dto';
import { ENV } from '@config/env';
import { EmailError } from '@application/errors/EmailError';
import { ICreateAdmin } from '@ports/usecases/admin/ICreateNewAdmin.usercase';

export class CreateAdmin implements ICreateAdmin {
   constructor(
      private readonly _adminRepository: IAdminRepository,
      private readonly _hashService: IHashService
   ) {}

   execute = async (
      dto: signupAdminDTO
   ): Promise<{ firstName: string; lastName?: string; email: string }> => {
      const emailExists = await this._adminRepository.emailExists(dto.email);

      if (emailExists) {
         throw new EmailError('Email already exists');
      }

      const passwordHash = await this._hashService.hash(
         dto.password,
         parseInt(ENV.PASSWORD_SALT as string)
      );

      const createAdminDTO: createAdminDTO = {
         firstName: dto.firstName,
         lastName: dto.lastName,
         email: dto.email,
         passwordHash,
      };

      const newAdmin = await this._adminRepository.create(createAdminDTO);

      if (!newAdmin) {
         throw new Error('cannot create new admin');
      }

      return { firstName: newAdmin.firstName, lastName: newAdmin.lastName, email: newAdmin.email };
   };
}
