import { AdminEmailLogin } from '@application/useCases/admin/AdminEmailLogin.usecase';
import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { RefreshAdminAccessToken } from '@application/useCases/admin/RefreshAdminToken.usecase';
import { mongoAdminRepositrory } from '@di/repository.container';
import { bcryptHashService, jwtService } from '@di/services.container';

export const createAdmin = new CreateAdmin(mongoAdminRepositrory, bcryptHashService);

export const adminEmailLogin = new AdminEmailLogin(
   mongoAdminRepositrory,
   bcryptHashService,
   jwtService
);
export const refreshAccessToken = new RefreshAdminAccessToken(jwtService);
