import { IUUIDService } from '@ports/IUUIDService';
import { randomUUID } from 'node:crypto';

export class CryptoUUIDService implements IUUIDService {
   generate(): string {
      return randomUUID();
   }
}
