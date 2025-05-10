import { OTP } from '@domain/services/otpGenerator';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { BcryptHashService } from '@infrastructure/service/BcryptHashService';
import { CryptoUUIDService } from '@infrastructure/service/CryptoUUIDService';
import { JWTService } from '@infrastructure/service/JWTService';

const jwtService = new JWTService();
const bcryptHashService = new BcryptHashService();
const otpService = new OTP();
const cryptoUUIDService = new CryptoUUIDService();
export { jwtService, bcryptHashService, otpService, cryptoUUIDService };


export const kafkaPubliserService = new KafkaPublisher(KafkaSingleton.getInstance())
