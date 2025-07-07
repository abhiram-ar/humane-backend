export interface IBaseRepository<T = any> {
   create(entiry: T): Promise<Required<T> | null>;
}
