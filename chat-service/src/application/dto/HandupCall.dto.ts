import z from 'zod';

export const hangupCallInputSchema = z.object({
   callId: z.string().nonempty(),
   clientDeviceId: z.string().nonempty(),
});

export type HangupCallInputDTO = z.infer<typeof hangupCallInputSchema>;
