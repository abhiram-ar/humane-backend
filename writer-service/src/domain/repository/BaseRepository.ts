export interface IBaseRepository<T> {
   create(entity: T): Promise<Required<T>>;
   delete(authorId: string, entityId: string): Promise<Required<T> | null>;

   get(entiryId: string): Promise<Required<T> | null>;
   exists(entityId: string): Promise<boolean>;
}
