import { SentEmailEvent } from './SentEmailEvent.type';

export type ForgotPasswordEmailField = {
   token: string;
};

export interface SendEmailUserForgotPasswordEvent
   extends SentEmailEvent<ForgotPasswordEmailField, 'user-forgot-password'> {}
