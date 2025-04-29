import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { createUserDTO } from "../DTOs/createUser.dto";

class userInteractor {
  constructor(private userRepository: IUserRepository) {}

  createUser = (dto: createUserDTO): void => {
    this.userRepository.create(dto);
  };
}
