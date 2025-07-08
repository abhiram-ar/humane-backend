import { IOneToOneMessageServices } from '@ports/usecases/IOneToOneMessage.services';
import { Request, Response, NextFunction } from 'express';

class MessageController {
   constructor(private readonly _oneToOneMessageController: IOneToOneMessageServices) {}
}
