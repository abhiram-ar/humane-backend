import { AdminEmailLogin } from '@application/useCases/admin/AdminEmailLogin.usecase';
import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { AdminGetUserList } from '@application/useCases/admin/GetUserList.usecase';
import { RefreshAdminAccessToken } from '@application/useCases/admin/RefreshAdminToken.usecase';
import { mongoAdminRepositrory, mongoUserRespository } from '@di/repository.container';
import { bcryptHashService, jwtService } from '@di/services.container';

export const createAdmin = new CreateAdmin(mongoAdminRepositrory, bcryptHashService);

export const adminEmailLogin = new AdminEmailLogin(
   mongoAdminRepositrory,
   bcryptHashService,
   jwtService
);

export const refreshAccessToken = new RefreshAdminAccessToken(jwtService);

export const adminGetUserList = new AdminGetUserList(mongoUserRespository);
