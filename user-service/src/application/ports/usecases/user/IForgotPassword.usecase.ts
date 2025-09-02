import { forgotPasswordDTO } from '@application/DTO-mapper/user/forgotPassword.dto';

export interface IForgotPassword {
   execute(dto: forgotPasswordDTO): Promise<{ email: string }>;
}
