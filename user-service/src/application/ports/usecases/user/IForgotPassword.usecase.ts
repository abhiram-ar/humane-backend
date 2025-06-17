import { forgotPasswordDTO } from '@dtos/user/forgotPassword.dto';

export interface IForgotPassword {
   execute(dto: forgotPasswordDTO): Promise<{ email: string }>;
}
