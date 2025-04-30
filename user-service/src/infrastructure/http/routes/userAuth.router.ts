import express from 'express';
import { UserAuthController } from '../controllers/user.controller';
import { MongoUserRepository } from '../../persistance/mongoDB/repository/MongoUserRepository';

const authRouter = express.Router();
const userRepository = new MongoUserRepository();

const userAuthController = new UserAuthController(userRepository);

authRouter.get('/signup', userAuthController.signup);

export default authRouter;
