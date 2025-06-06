export interface IBaseRepository<T> {
   create(entity: T): Promise<Required<T>>;
   delete(authorId: string, entityId: string): Promise<Required<T> | null>;
}
