import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';
import db from '../prisma-client';

export class PostgresBlockedRelationshipRepository implements IBlockedRelationshipRepository {
   isBlockedBy = async (checkUserId: string, blockerId: string): Promise<Boolean> => {
      const res = await db.blockedUser.findUnique({
         where: { blockerId_blockedId: { blockerId, blockedId: checkUserId } },
      });

      return !!res;
   };
}
