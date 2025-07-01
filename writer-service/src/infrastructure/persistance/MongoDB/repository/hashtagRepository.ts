import { HashTag } from '@domain/entities/hashtag.entity';
import { IHashtagRepository } from '@domain/repository/IHashtagRepository';
import hashtagModel from '../Models/hashtagModel';

export class HashTagRepository implements IHashtagRepository {
   create(entity: HashTag): Promise<Required<HashTag>> {
      throw new Error('Method not implemented.');
   }
   delete(authorId: string, entityId: string): Promise<Required<HashTag> | null> {
      throw new Error('Method not implemented.');
   }

   prefixSearch = async (query: string, limit: number): Promise<HashTag[]> => {
      const regex = new RegExp(query, 'i');
      const res = await hashtagModel
         .find({ name: regex }, { name: 1, count: 1, _id: 0 })
         .sort({ count: -1 })
         .limit(limit)
         .lean();

      return res.map((doc) => ({ name: doc.name, count: doc.count }));
   };
}
