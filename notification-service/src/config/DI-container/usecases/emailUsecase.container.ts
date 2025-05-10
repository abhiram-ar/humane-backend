import { SendPasswordRecoveryMail } from '@application/usecases/email/SendPasswordRecoveryMail';
import { SendUserVerificationMail } from '@application/usecases/email/SendVerificationMail';
import { nodeMailerEmailService } from '@DI-container/services.container';

export const sendVerificationMail = new SendUserVerificationMail(nodeMailerEmailService);

export const sendPasswordRecoveryMail = new SendPasswordRecoveryMail(nodeMailerEmailService);
