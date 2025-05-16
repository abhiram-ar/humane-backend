import { Anonymous } from '@domain/entities/anon.entity';
import { IAnonymousUserRepository } from '@ports/IAnonymousUserRepository';

export class ResolveAnoymousUser {
   constructor(private readonly _anonymousUserRepository: IAnonymousUserRepository) {}

   execute = async (anonId: string): Promise<Anonymous | null> => {
      // todo: check in distribureed cache

      const anon = await this._anonymousUserRepository.getAnonUser(anonId);
      if (!anon) return null;
      return anon;
   };
}
