export interface IBlockedRelationshipRepository {
   isBlockedBy(checkUserId: string, blockerId: string): Promise<Boolean>;
}
