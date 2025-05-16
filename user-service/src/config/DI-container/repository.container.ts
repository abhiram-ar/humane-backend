import { PostgresAdminRepository } from '@infrastructure/persistance/postgres/repository/AdminRepository';
import { PostresUserRepository } from '@infrastructure/persistance/postgres/repository/UserRepository';

// const mongoUserRespository = new MongoUserRepository();
// const mongoAdminRepositrory = new MongoAdminRepository();
// const mongoAnonUserRepository = new MongoAnonymousUserRepository();

const userRepository = new PostresUserRepository();
const adminRepository = new PostgresAdminRepository();

export { userRepository, adminRepository };
