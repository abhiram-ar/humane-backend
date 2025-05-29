import { PostgresAdminRepository } from '@infrastructure/persistance/postgres/repository/AdminRepository';
import { PostgresBlockedRelationshipRepository } from '@infrastructure/persistance/postgres/repository/BlockedRelationshipRepository';
import { PostgresFriendshipRepository } from '@infrastructure/persistance/postgres/repository/FriendshipRepository';
import { PostresUserRepository } from '@infrastructure/persistance/postgres/repository/UserRepository';

// const mongoUserRespository = new MongoUserRepository();
// const mongoAdminRepositrory = new MongoAdminRepository();
// const mongoAnonUserRepository = new MongoAnonymousUserRepository();

const userRepository = new PostresUserRepository();
const adminRepository = new PostgresAdminRepository();
const friendshipRepository = new PostgresFriendshipRepository();
const blockedRelationshipRepository = new PostgresBlockedRelationshipRepository();

export { userRepository, adminRepository, friendshipRepository, blockedRelationshipRepository };
