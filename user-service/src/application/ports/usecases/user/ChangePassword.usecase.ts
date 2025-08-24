import { ChangePasswordInputDTO } from '@dtos/user/ChangePassword.dto';

export interface IChangePassword {
   execute(dto: ChangePasswordInputDTO): Promise<{ success: boolean }>;
}
