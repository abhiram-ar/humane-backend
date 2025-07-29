import { HydratedDocument } from 'mongoose';
import { IConvoFrequentlyChangingMetadataDocument } from '../models/convoFrequntlyChangingMetadata.model';
import { ConvoFrequentlyChagingMetadata } from '@domain/ConvoFrequentlyChangingMetadata';

export const convoFreqChangingMetaAutomapper = (
   doc: HydratedDocument<IConvoFrequentlyChangingMetadataDocument>
): ConvoFrequentlyChagingMetadata => {
   const entiy: ConvoFrequentlyChagingMetadata = {
      convoId: doc.id ?? String(doc._id),
      updatedAt: doc.updatedAt,
   };

   return entiy;
};
