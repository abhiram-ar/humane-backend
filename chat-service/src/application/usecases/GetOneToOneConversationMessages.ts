import { GetOneToOneConvoMessagesInputDTO } from '@application/dto/GetOneToOneConvoMessages.dto';
import { ConversationNotFoundError } from '@application/errors/ConversationNotFoundError';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { IStorageService } from '@ports/services/IStorageService';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { IConvoUserMetadataServices } from '@ports/usecases/IConvoUserMetadataServices';
import { IGetOneToOneConversaionMessages } from '@ports/usecases/IGetOneToOneConversationMessages';
import { IOneToOneMessageServices } from '@ports/usecases/IOneToOneMessage.services';

export class GetOneToOneConversaionMessages implements IGetOneToOneConversaionMessages {
   constructor(
      private readonly _coverstionServices: IConversationServices,
      private readonly _oneToOneMessageServices: IOneToOneMessageServices,
      private readonly _storageServices: IStorageService,
      private readonly _convoUserMetaService: IConvoUserMetadataServices
   ) {}

   execute = async (
      dto: GetOneToOneConvoMessagesInputDTO
   ): Promise<{
      messages: AttachementURLHydratedMessage[];
      pagination: CurosrPagination;
   }> => {
      const conversation = await this._coverstionServices.getOneToOneConversationByParticipantIds([
         dto.userId,
         dto.otherUserId,
      ]);
      if (!conversation) throw new ConversationNotFoundError();

      const convoUserData = await this._convoUserMetaService.get({
         userId: dto.userId,
         convoId: conversation.id,
      });

      const { messages, pagination } = await this._oneToOneMessageServices.getMessages({
         conversationId: conversation.id,
         from: dto.from,
         limit: dto.limit,
         convoClearedAt: convoUserData?.clearedAt,
      });

      const attachmentURLHydratedMessages = messages.map((msg) => {
         const { attachment, ...data } = msg;

         let hydratedAttachment: { attachmentType: string; attachmentURL: string | undefined };
         if (attachment && attachment.attachmentKey && !data.status?.deleted) {
            hydratedAttachment = {
               attachmentType: attachment.attachmentType,
               attachmentURL: this._storageServices.getPublicCDNURL(attachment.attachmentKey),
            };
         } else {
            hydratedAttachment = {
               attachmentType: attachment ? attachment.attachmentType : '',
               attachmentURL: undefined,
            };
         }

         return {
            ...data,
            attachment: hydratedAttachment,
         };
      });

      return { messages: attachmentURLHydratedMessages, pagination };
   };
}
