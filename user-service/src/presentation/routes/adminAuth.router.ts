import { AdminEmailLogin } from '@application/useCases/admin/AdminEmailLogin.usecase';
import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { MongoAdminRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAdminRepository';
import { BcryptHashService } from '@infrastructure/service/BcryptHashService';
import { JWTService } from '@infrastructure/service/JWTService';
import { AdminAuthController } from '@presentation/controllers/adminAuth.controller';
import express from 'express';

const adminAuthRouter = express.Router();

const adminMongoRepository = new MongoAdminRepository();
const bcryptHashService = new BcryptHashService();
const jwtService = new JWTService();

const createAdmin = new CreateAdmin(adminMongoRepository, bcryptHashService);
const adminEmailLogin = new AdminEmailLogin(adminMongoRepository, bcryptHashService, jwtService);

const adminAuthController = new AdminAuthController(createAdmin, adminEmailLogin);

adminAuthRouter.post('/signup', adminAuthController.signup);
adminAuthRouter.post('/login', adminAuthController.login);

export default adminAuthRouter;
