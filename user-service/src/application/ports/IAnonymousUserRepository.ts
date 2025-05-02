import { Anonymous } from '@domain/entities/anon.entity';

export interface IAnonymousUserRepository {
   create(newAnon: Anonymous): Promise<Anonymous>;
}
