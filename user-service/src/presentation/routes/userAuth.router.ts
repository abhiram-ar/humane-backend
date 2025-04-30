import express from 'express';
import { UserAuthController } from '../controllers/user.controller';
import { MongoUserRepository } from '../../infrastructure/persistance/mongoDB/repository/MongoUserRepository';
import { OTP } from '../../domain/services/otpGenerator';
import { JWTService } from '../../infrastructure/service/JWTService';
import { SignupUser } from '../../application/useCases/SignupUser.usecase';
import { BcryptHashService } from '../../infrastructure/service/BcryptHashService';
import { VerifyUser } from '../../application/useCases/VerifyUser.usecase';

const authRouter = express.Router();

const userRepository = new MongoUserRepository();
const jwtService = new JWTService();
const otpService = new OTP();
const bcryptHashService = new BcryptHashService();
const singupUser = new SignupUser(userRepository, jwtService, otpService, bcryptHashService);
const verifyUser = new VerifyUser(userRepository, jwtService, bcryptHashService);
const userAuthController = new UserAuthController(singupUser, verifyUser);

authRouter.post('/signup', userAuthController.signup);
authRouter.post('/verify', userAuthController.verify);

export default authRouter;
