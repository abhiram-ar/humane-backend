import { SendUserVerificationMailDTO } from '@dtos/sendVerificationMailInput.dto';

export interface ISendUserVerificationMail {
   execute(dto: SendUserVerificationMailDTO): Promise<{ ack: boolean }>;
}
