import express from 'express';
import { UserAuthController } from '../controllers/user.controller';
import { MongoUserRepository } from '../../infrastructure/persistance/mongoDB/repository/MongoUserRepository';
import { OTP } from '../../domain/services/otpGenerator';
import { JWTService } from '../../infrastructure/service/JWTService';
import { SignupUser } from '../../application/useCases/SignupUser.usecase';
import { BcryptHashService } from '../../infrastructure/service/BcryptHashService';
import { VerifyUser } from '../../application/useCases/VerifyUser.usecase';
import { UserEmailLogin } from '../../application/useCases/UserEmailLogin.usecase';
import { RefreshUserAccessToken } from '../../application/useCases/RefreshUserToken.usecase';

const authRouter = express.Router();

const userRepository = new MongoUserRepository();
const jwtService = new JWTService();
const otpService = new OTP();
const bcryptHashService = new BcryptHashService();
const singupUser = new SignupUser(userRepository, jwtService, otpService, bcryptHashService);
const verifyUser = new VerifyUser(userRepository, jwtService, bcryptHashService);
const userEmailLogin = new UserEmailLogin(userRepository, bcryptHashService, jwtService);
const refreshUserAccessToken = new RefreshUserAccessToken(userRepository, jwtService);
const userAuthController = new UserAuthController(
   singupUser,
   verifyUser,
   userEmailLogin,
   refreshUserAccessToken
);

authRouter.post('/signup', userAuthController.signup);
authRouter.post('/verify', userAuthController.verify);
authRouter.post('/login/email', userAuthController.login);
authRouter.get('/refresh', userAuthController.refreshAccessToken);
authRouter.post('/logout', userAuthController.logout);

export default authRouter;
