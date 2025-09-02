import { signupUserDTO } from "@application/DTO-mapper/user/signupUser.dto";

export interface ISignupUser {
   execute(dto: signupUserDTO): Promise<string>;
}
