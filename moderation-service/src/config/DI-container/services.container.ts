import s3Client from '@config/s3-client';
import { NSFWJSImageClassifierService } from '@infrastructure/NSFWImageClassifierService/nsfwjs/NSFWImageClassifierService';
import { AWSStorageService } from '@infrastructure/storage/aws-s3/StorageService';
import { FFMPEGVideoService } from '@infrastructure/VideoService/VideoService';

export const nsfwImageClassifierService = new NSFWJSImageClassifierService();

export const storageService = new AWSStorageService(s3Client);

export const videoService = new FFMPEGVideoService();
