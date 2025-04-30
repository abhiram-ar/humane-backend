import { IHashService } from '../../application/ports/IHashService';
import bcrypt from 'bcryptjs';

export class BcryptHashService implements IHashService {
   hash = async (data: string, salt: number): Promise<string> => {
      return await bcrypt.hash(data, salt);
   };
   compare = async (data: string, hash: string): Promise<boolean> => {
      return await bcrypt.compare(data, hash);
   };
}
