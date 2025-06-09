import { IBaseRepository } from './IBaseRepository';
import { IPostDocument } from '../IPostDocument';

export interface IPostRepository extends IBaseRepository<IPostDocument> {
   replace(postId: string, doc: IPostDocument): Promise<void>;
}
