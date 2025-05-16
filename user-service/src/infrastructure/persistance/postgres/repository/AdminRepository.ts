import { Admin } from '@domain/entities/admin.entity';
import { createAdminDTO } from '@dtos/admin/createAdmin.dto';
import { IAdminRepository } from '@ports/IAdminRepository';
import db from '../prisma-client';

export class PostgresAdminRepository implements IAdminRepository {
   create = async (
      dto: createAdminDTO
   ): Promise<Pick<Admin, 'id' | 'email' | 'firstName' | 'lastName'> | null> => {
      const res = await db.admin.create({
         data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            passwordHash: dto.passwordHash,
         },
         select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
         },
      });

      if (!res) return null;

      return { ...res, lastName: res.lastName ?? undefined };
   };

   emailExists = async (email: string): Promise<boolean> => {
      const res = await db.admin.findUnique({ where: { email }, select: { id: true } });
      return res ? true : false;
   };

   retriveAdminByEmail = async (
      email: string
   ): Promise<Pick<Admin, 'id' | 'email' | 'passwordHash'> | null> => {
      const res = await db.admin.findUnique({
         where: { email },
         select: { id: true, email: true, passwordHash: true },
      });

      if (!res) return null;
      return res;
   };
}
