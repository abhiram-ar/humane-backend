import { GetUserStatsOutputDTO } from '@application/DTO-mapper/admin/userStats.dto';
import { IUserRepository } from '@ports/IUserRepository';
import { IUsersStat } from '@ports/usecases/admin/IUserStats.usecase';

export class UsersStat implements IUsersStat {
   constructor(private readonly _userRepo: IUserRepository) {}

   execute = async (): Promise<GetUserStatsOutputDTO> => {
      const usersLoggedInLast24hrs = await this._userRepo.findUsersLoggedInXTime(
         1000 * 60 * 60 * 24
      );
      const usersLoggedInLast48hrs = await this._userRepo.findUsersLoggedInXTime(
         1000 * 60 * 60 * 48
      );

      const totalUsers = await this._userRepo.findTotalUsers(new Date());

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const totalUsersLastMonth = await this._userRepo.findTotalUsers(lastMonth);

      const userSingupsInLast6Months = await this._userRepo.userSingupsHistory();

      return {
         logins: { usersLoggedInLast24hrs, usersLoggedInLast48hrs },
         totalUsers: { totalUsersLastMonth, currentTotalUsers: totalUsers },
         userSingupsInLast6Months,
      };
   };
}
