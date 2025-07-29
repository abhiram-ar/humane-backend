import { GetCovoUserMetadataInputDTO } from '@application/dto/GetConvoUserMetadata.dto';
import { ConvoUserMetadata } from '@domain/ConvoUserMetadata';

export interface IConvoUserMetadataServices {
   get(dto: GetCovoUserMetadataInputDTO): Promise<ConvoUserMetadata | null>;
}
