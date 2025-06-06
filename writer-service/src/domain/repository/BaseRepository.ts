export interface IBaseRepository<T> {
   create(entity: T): Promise<Required<T>>;
   delete(entity: T): Promise<Required<T>>;
}
