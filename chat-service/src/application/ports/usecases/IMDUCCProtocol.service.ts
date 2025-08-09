import { AcquireCallRecipientDeviceLockInputDTO } from '@application/dto/AcquireCallRecipientDeviceLock.dto';
import { InitiateCallInputDTO, InitiateCallOutputDTO } from '@application/dto/InitiateCall.dto';
import { ICallDescription } from '@domain/ICallDescription';

// Multi Device User Call Connect Protocol
export interface IMDUCCProtocolServices {
   initializeCall(dto: InitiateCallInputDTO): Promise<InitiateCallOutputDTO>;

   getCallDescription(callId: string): Promise<ICallDescription | null>;

   acquireRecipientDeviceLock(
      dto: AcquireCallRecipientDeviceLockInputDTO
   ): Promise<
      | { callDescription: ICallDescription | null; mutex: true }
      | { callDescription?: null; mutex: false }
   >;
}
