import { Anonymous } from '@domain/entities/anon.entity';
import { IAnonymousUserRepository } from '@ports/IAnonymousUserRepository';
import anoymousUserModel from '../models/anonymousUser.mode';

class MongoAnonymousUserRepository implements IAnonymousUserRepository {
   create = async (newAnon: Anonymous): Promise<Anonymous> => {
      const anon = await anoymousUserModel.create({
         anonId: newAnon.anonId,
         userId: newAnon.userId,
         expiresAt: newAnon.expiresAt,
         createdAt: newAnon.createdAt,
         revoked: newAnon.revoked,
      });
      return new Anonymous(anon.anonId, anon.userId, anon.expiresAt, anon.createdAt, anon.revoked);
   };

   getAnonUser = async (anonId: string): Promise<Anonymous | null> => {
      const anon = await anoymousUserModel.findOne({ anonId });
      if (!anon) return null;
      return new Anonymous(anon.anonId, anon.userId, anon.expiresAt, anon.createdAt, anon.revoked);
   };
}
