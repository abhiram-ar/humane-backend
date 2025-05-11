import { OTP } from '@domain/services/otpGenerator';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { BcryptHashService } from '@infrastructure/service/BcryptHashService';
import { CryptoUUIDService } from '@infrastructure/service/CryptoUUIDService';
import { JWTService } from '@infrastructure/service/JWTService';
import { AWSStorageService } from '@infrastructure/storage/aws-s3/AWSStorageService';

const jwtService = new JWTService();
const bcryptHashService = new BcryptHashService();
const otpService = new OTP();
const cryptoUUIDService = new CryptoUUIDService();
export { jwtService, bcryptHashService, otpService, cryptoUUIDService };

export const kafkaPubliserService = new KafkaPublisher(KafkaSingleton.getInstance());

export const awsStorageService = new AWSStorageService();
