import { AWSStorageService } from '@infrastructure/services/AWSStorageService';
import { ElasticSearchProxyService } from '@infrastructure/services/ElasticSearchProxyService';

export const esproxyService = new ElasticSearchProxyService();

export const  storageService = new AWSStorageService()