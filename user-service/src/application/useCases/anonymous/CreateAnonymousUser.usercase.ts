import { Anonymous } from '@domain/entities/anon.entity';
import { createAnonDTO } from '@dtos/anonymous/createAnon.dto';
import { IUUIDService } from '@ports/IUUIDService';

export class CreateAnonymousUser {
   constructor(private readonly UUIDService: IUUIDService) {}

   execute = (userId: string) => {
      const newAnon: createAnonDTO = {
         userId,
         anonId: this.UUIDService.generate(),
         expiresAt: Date.now() + Anonymous.ANON_EXPIRY_TIME_IN_MILLI_SECONDS,
         createdAt: Date.now(),
      };
   };
}
