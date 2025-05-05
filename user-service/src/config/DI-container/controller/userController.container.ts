import { UserAuthController } from '@presentation/controllers/user.controller';
import {
   forgotPassoword,
   recoverPassword,
   refreshUserAccessToken,
   singupUser,
   userEmailLogin,
   userGooglgAuth,
   verifyUser,
} from '@di/usecase/userUsercase.container';
import { googleOAuth2Client } from '@infrastructure/service/GoogleOAuth2Service';

export const userAuthController = new UserAuthController(
   singupUser,
   verifyUser,
   userEmailLogin,
   refreshUserAccessToken,
   forgotPassoword,
   recoverPassword,
   googleOAuth2Client,
   userGooglgAuth
);
