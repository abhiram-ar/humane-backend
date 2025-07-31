import { RedisCacheService } from '@infrastructure/cache/redis/CacheService';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { AWSStorageService } from '@infrastructure/services/AWSStorageService';
import { ElasticSearchProxyService } from '@infrastructure/services/ElasticSearchProxyService';

export const esproxyService = new ElasticSearchProxyService();

export const storageService = new AWSStorageService();

export const eventPubliser = new KafkaPublisher(KafkaSingleton.getInstance());

export const cacheService = new RedisCacheService();
