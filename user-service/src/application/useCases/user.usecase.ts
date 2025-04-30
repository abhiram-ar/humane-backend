import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { createUserDTO } from "../../infrastructure/DTOs/user/createUser.dto";

class userInteractor {
  constructor(private userRepository: IUserRepository) {}

  createUser = (dto: createUserDTO): void => {
    this.userRepository.create(dto);
  };
}
