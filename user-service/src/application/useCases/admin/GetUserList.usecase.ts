import { IPagination } from '@application/types/Pagination.type';
import { User } from '@domain/entities/user.entity';
import { GetUserDTO } from '@dtos/admin/getUsers.dto';
import { IUserRepository } from '@ports/IUserRepository';

export class AdminGetUserList {
   constructor(private readonly userRepository: IUserRepository) {}

   execute = async (
      dto: GetUserDTO
   ): Promise<{
      users: Pick<User, 'id' | 'email' | 'firstName' | 'isBlocked'>[];
      pagination: IPagination;
   }> => {
      const skip = (dto.page - 1) * dto.limit;
      console.log('skpi', skip);

      const result = await this.userRepository.getUserList({ ...dto, skip });

      const totalPages = Math.ceil(result.totalEntries / dto.limit);

      const pagination: IPagination = {
         page: dto.page,
         limit: dto.limit,
         totalItems: result.totalEntries,
         totalPages,
      };

      return { users: result.users, pagination };
   };
}
