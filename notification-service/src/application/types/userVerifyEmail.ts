import { SentEmailEvent } from './SentEmailEvent.type';

export type UserVerifyEmailDataFields = {
   otp: string;
   firstName: string;
};

export interface SendEmailVerificationEvent
   extends SentEmailEvent<UserVerifyEmailDataFields, 'email-verification'> {}
