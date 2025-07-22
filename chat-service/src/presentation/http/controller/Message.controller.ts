import {
   GetOneToOneConvoMessagesInputDTO,
   getOneToOneConvoMessagesInputSchema,
} from '@application/dto/GetOneToOneConvoMessages.dto';
import { IGetOneToOneConversaionMessages } from '@ports/usecases/IGetOneToOneConversationMessages';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';
export class MessageController {
   constructor(
      private readonly _getOneToOneConversationMessages: IGetOneToOneConversaionMessages
   ) {}

   getOneToOneConvoMessages = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') throw new UnAuthenticatedError();
         const { otherUserId, from, limit } = req.query;

         const dto: GetOneToOneConvoMessagesInputDTO = {
            userId: req.user.userId,
            otherUserId: otherUserId as string,
            from: (from as string) ?? null,
            limit: limit ? parseInt(limit as string) : 10,
         };

         const validatedDTO = getOneToOneConvoMessagesInputSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const result = await this._getOneToOneConversationMessages.execute(validatedDTO.data);

         res.status(HttpStatusCode.Ok).json({ data: result });
      } catch (error) {
         next(error);
      }
   };
}
