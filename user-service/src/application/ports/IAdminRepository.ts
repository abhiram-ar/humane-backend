import { Admin } from '@domain/entities/admin.entity';
import { createAdminDTO } from '@dtos/admin/createAdmin.dto';

export interface IAdminRepository {
   create(
      dto: createAdminDTO
   ): Promise<Pick<Admin, 'id' | 'email' | 'firstName' | 'lastName'> | null>;

   emailExists(email: string): Promise<boolean>;

   retriveAdminByEmail(email: string): Promise<Pick<Admin, 'id' | 'email' | 'passwordHash'> | null>;
}
