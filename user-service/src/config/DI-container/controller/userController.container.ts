import { UserAuthController } from '@presentation/controllers/user.controller';
import {
   forgotPassoword,
   recoverPassword,
   refreshUserAccessToken,
   singupUser,
   userEmailLogin,
   verifyUser,
} from '@di/usecase/userUsercase.container';

export const userAuthController = new UserAuthController(
   singupUser,
   verifyUser,
   userEmailLogin,
   refreshUserAccessToken,
   forgotPassoword,
   recoverPassword
);
