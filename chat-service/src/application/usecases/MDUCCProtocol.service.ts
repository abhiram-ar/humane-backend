import { InitiateCallInputDTO, InitiateCallOutputDTO } from '@application/dto/InitiateCall.dto';
import { AppConstants } from '@config/constants';
import { redisClient } from '@infrastructure/cache/redis/client';
import { ICacheService } from '@ports/services/ICacheService';

// Multi Device User Call Connect Protocol
export class MDUCCProtocolServices {
   private static getCallKeyById(callId: string) {
      return `call:${callId}`;
   }

   constructor(private readonly _cache: ICacheService) {}

   initializeCall = async (dto: InitiateCallInputDTO): Promise<InitiateCallOutputDTO> => {
      let { callId, ...callMetadata } = dto;

      if (!callId) {
         callId = crypto.randomUUID();
      }

      const key = MDUCCProtocolServices.getCallKeyById(callId);

      await redisClient.hSet(key, {
         callerId: dto.callerId,
         callerDeviceId: dto.callerDeviceId,
         recipientId: dto.recipientId,
      });
      await redisClient.pExpire(key, AppConstants.TIME_5MIN);

      return { callId, ...callMetadata };
   };
}
