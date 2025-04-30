export interface IHashService {
   hash(data: string, salt: number): Promise<string>;
   compare(data: string, hash: string): Promise<boolean>;
}
