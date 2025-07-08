import {
   CreateConversationInputDTO,
   createConversationSchema,
} from '@application/dto/CreateConversation.dto';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';

export class ConversationController {
   constructor(private readonly _conversationServices: IConversationServices) {}

   createConversation = async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || req.user.type !== 'user') throw new UnAuthenticatedError();

      const dto: CreateConversationInputDTO = {
         type: req.body.type,
         participants: [req.user.userId, ...req.body.OtherParticipants],
         groupName: req.body.groupName,
         groupPicKey: req.body.groupPicKey,
      };

      const validtedDTO = createConversationSchema.safeParse(dto);
      if (!validtedDTO.success) {
         throw new ZodValidationError(validtedDTO.error);
      }

      const newConversation = await this._conversationServices.create(validtedDTO.data);

      res.status(HttpStatusCode.Ok).json({ data: { conversation: newConversation } });
   };
}
