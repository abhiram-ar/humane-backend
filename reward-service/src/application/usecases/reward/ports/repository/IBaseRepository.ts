export interface IBaseRepository<T> {
   create(entity: T): Promise<Required<T>>;
   get(id: string): Promise<T | null>;
   delete(id: string): Promise<T | null>;
}
