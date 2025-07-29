import { HydratedDocument } from 'mongoose';
import { IConvoUserMetadataDocument } from '../models/convoUserMetadata.model';
import { ConvoUserMetadata } from '@domain/ConvoUserMetadata';

export const convoUserMetaAutomapper = (
   doc: HydratedDocument<IConvoUserMetadataDocument>
): ConvoUserMetadata => {
   const entiy: ConvoUserMetadata = {
      convoId: doc.id ?? String(doc._id),
      userId: doc.userId,
      clearedAt: doc.clearedAt,
   };

   return entiy;
};
