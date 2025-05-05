import { jwtService } from '@di/services.container';
import { refreshAccessToken } from '@di/usecase/adminUsercase.container';
import { refreshUserAccessToken } from '@di/usecase/userUsercase.container';
import { GlobalRefreshController } from '@presentation/controllers/globalRefresh.controller';

export const globalRefreshController = new GlobalRefreshController(
   jwtService,
   refreshAccessToken,
   refreshUserAccessToken
);
