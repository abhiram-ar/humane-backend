import { recoverPasswordDTO } from '@application/DTO-mapper/user/recoverPassword.dto';

export interface IRecoverPassword {
   execute(dto: recoverPasswordDTO): Promise<{ email: string }>;
}
