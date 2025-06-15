import { recoverPasswordDTO } from '@dtos/user/recoverPassword.dto';

export interface IRecoverPassword {
   execute(dto: recoverPasswordDTO): Promise<{ email: string }>;
}
