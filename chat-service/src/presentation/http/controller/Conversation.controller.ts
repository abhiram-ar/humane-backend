import {
   CreateConversationInputDTO,
   createConversationSchema,
} from '@application/dto/CreateConversation.dto';
import {
   getUserConversaionsInputSchema,
   GetUserConversationInputDTO,
} from '@application/dto/GetUserConversations.dto';
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

   getUserRecentConversations = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') throw new UnAuthenticatedError();
         const { from, limit } = req.query;

         const dto: GetUserConversationInputDTO = {
            userId: req.user.userId,
            from: (from as string) || null,
            limit: limit ? parseInt(limit as string) : 10,
         };

         const validtedDTO = getUserConversaionsInputSchema.safeParse(dto);
         if (!validtedDTO.success) {
            throw new ZodValidationError(validtedDTO.error);
         }
         const result = await this._conversationServices.getUserConversation(validtedDTO.data);

         res.status(HttpStatusCode.Ok).json({ data: result });
      } catch (error) {
         next(error);
      }
   };
}
