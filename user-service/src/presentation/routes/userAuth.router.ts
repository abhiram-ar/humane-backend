import express from 'express';
import { UserAuthController } from '../controllers/user.controller';
import { MongoUserRepository } from '../../infrastructure/persistance/mongoDB/repository/MongoUserRepository';
import { OTP } from '../../domain/services/otpGenerator';
import { JWTService } from '../../infrastructure/service/JWTService';
import { SignupUser } from '../../application/useCases/SignupUser.usecase';
import { BcryptHashService } from '../../infrastructure/service/BcryptHashService';

const authRouter = express.Router();

const userRepository = new MongoUserRepository();
const jwtService = new JWTService();
const otpService = new OTP();
const bcryptHashService = new BcryptHashService();
const singupUser = new SignupUser(userRepository, jwtService, otpService, bcryptHashService);
const userAuthController = new UserAuthController(singupUser);

authRouter.get('/signup', userAuthController.signup);
authRouter.post('/verify', userAuthController.verify);

export default authRouter;
