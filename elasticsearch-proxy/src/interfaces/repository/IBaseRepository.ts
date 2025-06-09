export interface IBaseRepository<T> {
   create(entity: T): Promise<void>;
   deleteById(itemId: string): Promise<{ found: boolean; deleted: boolean }>;
   getUpdatedAt(itemId: string): Promise<{ updatedAt: string } | null>;
   getByIds(ids: string[]): Promise<(T | null)[]>;
}
