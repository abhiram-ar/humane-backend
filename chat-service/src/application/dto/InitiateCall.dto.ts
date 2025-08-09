import z from 'zod';

const initiateCallInputSchema = z.object({
   callId: z.string().nonempty().optional(),
   callerId: z.string().nonempty(),
   callerDeviceId: z.string().nonempty(),
   recipientId: z.string().nonempty(),
});

export type InitiateCallInputDTO = z.infer<typeof initiateCallInputSchema>;

export type InitiateCallOutputDTO = Required<InitiateCallInputDTO>;
