import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { MongoAdminRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAdminRepository';
import { BcryptHashService } from '@infrastructure/service/BcryptHashService';
import { AdminAuthController } from '@presentation/controllers/adminAuth.controller';
import express from 'express';

const adminAuthRouter = express.Router();

const adminMongoRepository = new MongoAdminRepository();
const bcryptHashService = new BcryptHashService();
const createAdmin = new CreateAdmin(adminMongoRepository, bcryptHashService);
const adminAuthController = new AdminAuthController(createAdmin);

adminAuthRouter.post('/signup', adminAuthController.signup);

export default adminAuthRouter;
