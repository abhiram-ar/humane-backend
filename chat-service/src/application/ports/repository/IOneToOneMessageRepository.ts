import { Message } from '@domain/Message';
import { IBaseRepository } from './IBaseRepository';

export interface IOneToOneMessageRepository extends IBaseRepository<Message> {}
