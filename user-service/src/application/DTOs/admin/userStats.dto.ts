export type GetUserStatsOutputDTO = {
   logins: {
      usersLoggedInLast24hrs: number;
      usersLoggedInLast48hrs: number;
   };
   totalUsers: {
      currentTotalUsers: number;
      totalUsersLastMonth: number;
   };
   userSingupsInLast6Months: { month: string; count: number }[];
};
