import { Message } from '@domain/Message';

export type AttachementURLHydratedMessage = Omit<Required<Message>, 'attachment'> & {
   attachment: { attachmentType: string; attachmentURL: string | undefined };
};
