import { AdminAuthController } from '@presentation/controllers/adminAuth.controller';
import {
   adminEmailLogin,
   adminGetUserList,
   createAdmin,
   refreshAccessToken,
} from '@di/usecase/adminUsercase.container';
import { AdminUserManagementController } from '@presentation/controllers/adminUserMangement.controller';

export const adminAuthController = new AdminAuthController(
   createAdmin,
   adminEmailLogin,
   refreshAccessToken
);

export const adminUserManagementController = new AdminUserManagementController(adminGetUserList);
