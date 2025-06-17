export interface IRefreshAdminAccessToken {
   execute(refreshToken: string): Promise<{ newAccessToken: string }>;
}
