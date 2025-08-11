import { AcquireCallRecipientDeviceLockInputDTO } from '@application/dto/AcquireCallRecipientDeviceLock.dto';
import { HangupCallInputDTO } from '@application/dto/HandupCall.dto';
import { InitiateCallInputDTO, InitiateCallOutputDTO } from '@application/dto/InitiateCall.dto';
import { AppConstants } from '@config/constants';
import { logger } from '@config/logger';
import { ICallDescription } from '@domain/ICallDescription';
import { ICacheService } from '@ports/services/ICacheService';
import { IMDUCCProtocolServices } from '@ports/usecases/IMDUCCProtocol.service';

// Multi Device User Call Connect Protocol
export class MDUCCProtocolServices implements IMDUCCProtocolServices {
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
      const initiatedAt = new Date().toISOString();

      await this._cache.hSet(key, {
         callerId: dto.callerId,
         callerDeviceId: dto.callerDeviceId,
         recipientId: dto.recipientId,
         initiatedAt,
      });

      await this._cache.setKeyExpiryInSeconds(key, AppConstants.TIME_5MIN);

      return { callId, initiatedAt, ...callMetadata };
   };

   getCallDescription = async (callId: string): Promise<ICallDescription | null> => {
      if (!callId) return null;

      const key = MDUCCProtocolServices.getCallKeyById(callId);
      const callDesc = await this._cache.hGetAll(key);
      if (!callDesc) {
         return null;
      }

      // for each successsive call
      await this._cache.setKeyExpiryInSeconds(key, AppConstants.TIME_8HRS, 'GT');

      return { callId, ...callDesc } as unknown as ICallDescription;
   };

   acquireRecipientDeviceLock = async (
      dto: AcquireCallRecipientDeviceLockInputDTO
   ): Promise<
      | { callDescription: ICallDescription | null; mutex: true }
      | { callDescription?: null; mutex: false }
   > => {
      const key = MDUCCProtocolServices.getCallKeyById(dto.callId);
      const field: keyof ICallDescription = 'recipientDeviceId';

      const firstFieldEntry = await this._cache.hSetNotExistingField(
         key,
         field,
         dto.recipientDeviceId
      );

      if (!firstFieldEntry) return { mutex: false, callDescription: null };

      const callDesc = await this.getCallDescription(dto.callId);
      return { callDescription: callDesc, mutex: true };
   };

   hangUpCall = async (
      dto: HangupCallInputDTO
   ): Promise<{ handup: boolean; callDescription?: ICallDescription }> => {
      const calldesc = await this.getCallDescription(dto.callId);
      if (!calldesc) return { handup: false };

      if (
         !(calldesc.callerDeviceId === dto.clientDeviceId) &&
         !(calldesc.recipientDeviceId === dto.clientDeviceId)
      ) {
         logger.warn(`${MDUCCProtocolServices.name}: foreign device cannot end call`);
         return { handup: false };
      }

      if (calldesc.endedAt) return { handup: false, callDescription: calldesc };

      const key = MDUCCProtocolServices.getCallKeyById(dto.callId);
      const field: keyof ICallDescription = 'endedAt';

      // this should be first field entry, we already handled the exiting state above
      await this._cache.hSetNotExistingField(key, field, new Date().toISOString());

      // reduce the expiry on call handup
      await this._cache.setKeyExpiryInSeconds(key, AppConstants.TIME_5MIN, 'LT');

      return { handup: true, callDescription: calldesc };
   };
}
