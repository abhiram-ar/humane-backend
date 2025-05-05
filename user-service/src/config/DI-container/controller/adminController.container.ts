import { AdminAuthController } from '@presentation/controllers/adminAuth.controller';
import {
   adminEmailLogin,
   createAdmin,
   refreshAccessToken,
} from '@di/usecase/adminUsercase.container';

export const adminAuthController = new AdminAuthController(
   createAdmin,
   adminEmailLogin,
   refreshAccessToken
);
