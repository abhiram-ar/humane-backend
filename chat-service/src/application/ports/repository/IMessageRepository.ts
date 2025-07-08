import { Message } from '@domain/Message';
import { IBaseRepository } from './IBaseRepository';

export interface IMessageRepository extends IBaseRepository<Message> {}
