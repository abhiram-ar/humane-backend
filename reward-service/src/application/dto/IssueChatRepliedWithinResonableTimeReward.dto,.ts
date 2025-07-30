import { FirstReplyWithin24HrEventPayload } from 'humane-common/build/events/chat-service-events';
import z from 'zod';

export const issueChatRepliedWithinResonableTimeInputSchema = z.object({
   messageId: z.string().nonempty(),

   senderId: z.string().nonempty(),
   conversationId: z.string().nonempty(),
   sendAt: z.coerce.date(),

   repliedToUserId: z.string().nonempty(),
});

export type IssueChatRepliedWithinResonableTimeInputDTO = z.infer<
   typeof issueChatRepliedWithinResonableTimeInputSchema
>;

const assertTypeCompatability: <T extends FirstReplyWithin24HrEventPayload>() => void = () => {};
assertTypeCompatability<IssueChatRepliedWithinResonableTimeInputDTO>();
