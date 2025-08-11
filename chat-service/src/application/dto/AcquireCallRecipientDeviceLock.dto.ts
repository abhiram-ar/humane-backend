import z from 'zod';

export const acquireCallRecipientDeviceLockSchema = z.object({
   callId: z.string().nonempty(),
   recipientDeviceId: z.string().nonempty(),
});

export type AcquireCallRecipientDeviceLockInputDTO = z.infer<
   typeof acquireCallRecipientDeviceLockSchema
>;
