import { ModeratePostMedia } from '@application/usecases/ModeratePostMedia';
import s3Client from '@config/s3-client';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { NSFWJSImageClassifierService } from '@infrastructure/NSFWImageClassifierService/nsfwjs/NSFWImageClassifierService';
import { AWSStorageService } from '@infrastructure/storage/aws-s3/StorageService';
import { FFMPEGVideoService } from '@infrastructure/VideoService/VideoService';

export const eventPublisher = new KafkaPublisher(KafkaSingleton.getInstance());

export const nsfwImageClassifierService = new NSFWJSImageClassifierService();

export const storageService = new AWSStorageService(s3Client);

export const videoService = new FFMPEGVideoService();

export const moderationService = new ModeratePostMedia(
   nsfwImageClassifierService,
   storageService,
   videoService
);
