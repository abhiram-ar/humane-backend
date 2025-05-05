import { OTP } from '@domain/services/otpGenerator';
import { BcryptHashService } from '@infrastructure/service/BcryptHashService';
import { CryptoUUIDService } from '@infrastructure/service/CryptoUUIDService';
import { JWTService } from '@infrastructure/service/JWTService';
import { NodeMailerEmailService } from '@infrastructure/service/NodeMailerEmailService';

const jwtService = new JWTService();
const bcryptHashService = new BcryptHashService();
const otpService = new OTP();
const cryptoUUIDService = new CryptoUUIDService();

const nodeMailerEmailService = new NodeMailerEmailService();

export { jwtService, bcryptHashService, otpService, cryptoUUIDService, nodeMailerEmailService };
