import { Conversation } from '@domain/Conversation';

export interface IFindOtherParticipantOfOneToOneConvo {
   execute(participants: Conversation['participants'], currentUserId: string): string;
}
