import { IUserRepository } from "../ports/IUserRepository";
import { createUserDTO } from "../DTOs/user/createUser.dto";

class userInteractor {
  constructor(private userRepository: IUserRepository) {}

  createUser = (dto: createUserDTO): void => {
    this.userRepository.create(dto);
  };
}
