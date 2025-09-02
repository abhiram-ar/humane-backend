import { Admin } from '@domain/entities/admin.entity';
import { createAdminDTO } from '@application/DTO-mapper/admin/createAdmin.dto';
import { IBaseRepository } from './IBaseRepository';

export interface IAdminRepository extends IBaseRepository {
   create(
      dto: createAdminDTO
   ): Promise<Pick<Admin, 'id' | 'email' | 'firstName' | 'lastName'> | null>;

   emailExists(email: string): Promise<boolean>;

   retriveAdminByEmail(email: string): Promise<Pick<Admin, 'id' | 'email' | 'passwordHash'> | null>;
}
