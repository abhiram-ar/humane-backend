import { AdminEmailLogin } from '@application/useCases/admin/AdminEmailLogin.usecase';
import { AdminUpdateUserBlockStatus } from '@application/useCases/admin/BlockUser.usecase';
import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { AdminGetUserList } from '@application/useCases/admin/GetUserList.usecase';
import { RefreshAdminAccessToken } from '@application/useCases/admin/RefreshAdminToken.usecase';
import { adminRepository, userRepository } from '@di/repository.container';
import { bcryptHashService, jwtService } from '@di/services.container';

export const createAdmin = new CreateAdmin(adminRepository, bcryptHashService);

export const adminEmailLogin = new AdminEmailLogin(adminRepository, bcryptHashService, jwtService);

export const refreshAccessToken = new RefreshAdminAccessToken(jwtService);

export const adminGetUserList = new AdminGetUserList(userRepository);

export const adminUpdateUserBlockStatus = new AdminUpdateUserBlockStatus(userRepository);
