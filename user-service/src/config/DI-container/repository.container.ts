import { MongoAdminRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAdminRepository';
import { MongoAnonymousUserRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAnoymousUserRepository';
import { MongoUserRepository } from '@infrastructure/persistance/mongoDB/repository/MongoUserRepository';

const mongoUserRespository = new MongoUserRepository();
const mongoAnonUserRepository = new MongoAnonymousUserRepository();
const mongoAdminRepositrory = new MongoAdminRepository();

export { mongoUserRespository, mongoAnonUserRepository, mongoAdminRepositrory };
