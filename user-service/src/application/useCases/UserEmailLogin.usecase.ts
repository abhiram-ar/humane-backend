import { userLoginDTO } from '../DTOs/user/userLogin.dto';
import { IHashService } from '../ports/IHashService';
import { IUserRepository } from '../ports/IUserRepository';

class UserLogin {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly hasingService: IHashService
   ) {}

   execute = async (dto: userLoginDTO) => {
      // retrive userInfo
      const user = await this.userRepository.retriveUserByEmail(dto.email);
      if (!user) {
         throw new Error('user not found');
      }

      if (!user.passwordHash) {
         throw new Error('User has no passwordHash, Account might be created Using Social Auth');
      }
      // check password
      const passwordMatch = this.hasingService.compare(dto.password, user.passwordHash);
      if (!passwordMatch) {
         throw new Error('password does not match');
      }

      // create anon id
      // todo: replace this with real annon is
      let anonId = user.id;

      // create JWT
   };
}
