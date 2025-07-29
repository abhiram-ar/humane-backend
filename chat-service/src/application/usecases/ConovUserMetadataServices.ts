import { GetCovoUserMetadataInputDTO } from '@application/dto/GetConvoUserMetadata.dto';
import { ConvoUserMetadata } from '@domain/ConvoUserMetadata';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import { IConvoUserMetadataServices } from '@ports/usecases/IConvoUserMetadataServices';

export class ConovUserMetadataServices implements IConvoUserMetadataServices {
   constructor(private readonly _convoRepo: IConversationRepository) {}
   get = async (dto: GetCovoUserMetadataInputDTO): Promise<ConvoUserMetadata | null> => {
      return await this._convoRepo.getUserConvoMetadata(dto.userId, dto.convoId);
   };
}
