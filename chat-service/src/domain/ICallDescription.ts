export interface ICallDescription {
   callId: string;

   callerId: string;
   callerDeviceId: string;
   inititiatedAt: string; // iso string

   recipientId: string;
   recipientDeviceId?: string;

   endedAt?: string;
}
