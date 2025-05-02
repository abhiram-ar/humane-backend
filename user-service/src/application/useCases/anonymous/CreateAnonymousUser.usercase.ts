import { Anonymous } from '@domain/entities/anon.entity';
import { IAnonymousUserRepository } from '@ports/IAnonymousUserRepository';
import { IUUIDService } from '@ports/IUUIDService';

export class CreateAnonymousUser {
   constructor(
      private readonly anonUserRepository: IAnonymousUserRepository,
      private readonly UUIDService: IUUIDService
   ) {}

   execute = async (userId: string): Promise<Anonymous> => {
      const newAnon = new Anonymous(
         this.UUIDService.generate(),
         userId,
         Date.now() + Anonymous.ANON_EXPIRY_TIME_IN_MILLI_SECONDS,
         Date.now()
      );

      const anon = await this.anonUserRepository.create(newAnon);
      return anon;
   };
}
