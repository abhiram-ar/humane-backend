import { ChangePasswordInputDTO } from '@application/DTO-mapper/user/ChangePassword.dto';

export interface IChangePassword {
   execute(dto: ChangePasswordInputDTO): Promise<{ success: boolean }>;
}
