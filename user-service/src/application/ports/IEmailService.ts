import { SendEmailVerificationEvent } from '@application/types/userVerifyEmail';

export interface IEmailService {
   send(event: SendEmailVerificationEvent): Promise<{ ack: boolean }>;
}
