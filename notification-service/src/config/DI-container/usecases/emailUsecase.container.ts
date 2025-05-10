import { SendPasswordRecoveryMail } from '@application/usecases/email/SendPasswordRecoveryMail';
import { nodeMailerEmailService } from '../services.container';

export const sendVerificationMail = new SendPasswordRecoveryMail(nodeMailerEmailService);

export const sendPasswordRecoveryMail = new SendPasswordRecoveryMail(nodeMailerEmailService);
