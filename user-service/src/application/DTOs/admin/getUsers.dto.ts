import { User } from '@domain/entities/user.entity';
import z from 'zod';

export const getUsersForAdminSchema = z.object({
   searchQuery: z.string().optional(),
   page: z.number().positive('page annot be 0').default(1),
   limit: z.number().positive('limit cannot be 0 or negative').default(10),
});

export type GetUserDTO = z.infer<typeof getUsersForAdminSchema>;

export type AdminGetUserResponseDTO = Pick<
   User,
   | 'id'
   | 'firstName'
   | 'lastName'
   | 'email'
   | 'isBlocked'
   | 'isHotUser'
   | 'createdAt'
   | 'humaneScore'
>;
