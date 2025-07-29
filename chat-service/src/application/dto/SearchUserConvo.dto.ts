import { UserDetailsFromES } from '@application/Types/ESSearchUser.type';
import { ConversationWithLastMessage } from '@infrastructure/persistance/mongo/automapper/conversationWithLastMessageAutomapper';
import z from 'zod';

export const searchUserConvoInputSchema = z.object({
   currentUserId: z.string().nonempty(),
   searchQuery: z.string().nonempty(),
   page: z.number().positive('page annot be 0').default(1),
   limit: z.number().positive('limit cannot be 0 or negative').default(10),
});

export type SearchUserConvoInputDTO = z.infer<typeof searchUserConvoInputSchema>;

export type StartNewConvo = { otherUser: UserDetailsFromES };
export type ExistingConvo = ConversationWithLastMessage & StartNewConvo;

export type SearchUserConvoOutputDTO = {
   existingConvos: ExistingConvo[];
   startNewConvos: StartNewConvo[];
};
