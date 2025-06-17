import { SendPasswordRecoveryMailInputDTO } from '@dtos/sendPasswordRecoveryMailInput.dto';

export interface ISendPasswordRecoveryMail {
   execute(dto: SendPasswordRecoveryMailInputDTO): Promise<{ ack: boolean }>;
}
