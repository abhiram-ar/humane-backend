import { signupUserDTO } from "@dtos/user/signupUser.dto";

export interface ISignupUser {
   execute(dto: signupUserDTO): Promise<string>;
}
