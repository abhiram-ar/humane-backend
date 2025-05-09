import { OTP } from '@domain/services/otpGenerator';
import { BcryptHashService } from '@infrastructure/service/BcryptHashService';
import { CryptoUUIDService } from '@infrastructure/service/CryptoUUIDService';
import { JWTService } from '@infrastructure/service/JWTService';

const jwtService = new JWTService();
const bcryptHashService = new BcryptHashService();
const otpService = new OTP();
const cryptoUUIDService = new CryptoUUIDService();
export { jwtService, bcryptHashService, otpService, cryptoUUIDService };
