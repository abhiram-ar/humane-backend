import { SendPasswordRecoveryMail } from '@application/usecases/email/SendPasswordRecoveryMail';
import { nodeMailerEmailService } from '@DI-container/services.container';

export const sendVerificationMail = new SendPasswordRecoveryMail(nodeMailerEmailService);

export const sendPasswordRecoveryMail = new SendPasswordRecoveryMail(nodeMailerEmailService);
