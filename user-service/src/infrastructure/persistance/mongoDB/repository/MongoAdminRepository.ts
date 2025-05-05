import { Admin } from '@domain/entities/admin.entity';
import { createAdminDTO } from '@dtos/admin/createAdmin.dto';
import { IAdminRepository } from '@ports/IAdminRepository';
import { adminModel } from '../models/admin.model';

export class MongoAdminRepository implements IAdminRepository {
   create = async (dto: createAdminDTO): Promise<Omit<Admin, 'passwordHash'> | null> => {
      const newAdmin = await adminModel.create({
         email: dto.email,
         firstName: dto.firstName,
         lastName: dto.lastName,
         passwordHash: dto.passwordHash,
      });

      if (!newAdmin) return null;

      return {
         id: newAdmin.id,
         email: newAdmin.email,
         firstName: newAdmin.firstName,
         lastName: newAdmin.lastName,
      };
   };

   emailExists = async (email: string): Promise<boolean> => {
      const admin = await adminModel.findOne({ email: email });

      return admin ? true : false;
   };

   retriveAdminByEmail = async (
      email: string
   ): Promise<Pick<Admin, 'id' | 'email' | 'passwordHash'> | null> => {
      const admin = await adminModel.findOne({ email });

      if (!admin) {
         return null;
      }

      return { id: admin.id, email: admin.email, passwordHash: admin.passwordHash };
   };
}
