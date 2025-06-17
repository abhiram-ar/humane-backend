export interface IRefreshUserAccessToken {
   execute(refreshToken: string): Promise<{ newAccessToken: string }>;
}
