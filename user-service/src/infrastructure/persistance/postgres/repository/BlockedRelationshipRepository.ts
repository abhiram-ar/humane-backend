import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';

export class PostgresBlockedRelationshipRepository implements IBlockedRelationshipRepository {
   isBlockedBy(checkUserId: string, blockerId: string): Promise<Boolean> {
      throw new Error('Method not implemented.');
   }
}
