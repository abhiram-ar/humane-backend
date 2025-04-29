import { createUserDTO } from "../../application/DTOs/createUser.dto";
import { User } from "../entities/user.entity";

export interface IUserRepository {
  create(
    dto: createUserDTO
  ): Promise<Pick<User, "id" | "firstName" | "lastName" | "email">>;
}
