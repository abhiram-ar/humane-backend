import { MongoAdminRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAdminRepository';
import { MongoAnonymousUserRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAnoymousUserRepository';
import { MongoUserRepository } from '@infrastructure/persistance/mongoDB/repository/MongoUserRepository';
import { PostresUserRepository } from '@infrastructure/persistance/postgres/repository/UserRepository';

// const mongoUserRespository = new MongoUserRepository();
const mongoAnonUserRepository = new MongoAnonymousUserRepository();
const mongoAdminRepositrory = new MongoAdminRepository();
const userRepository = new PostresUserRepository();

export { mongoAnonUserRepository, mongoAdminRepositrory, userRepository };
