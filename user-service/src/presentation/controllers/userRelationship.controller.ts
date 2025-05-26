import { Request, Response, NextFunction } from 'express';
import { SendFriendRequest } from '@application/useCases/friendship/SendFriendRequest.usecase';
import { sendFriendRequestInputSchema } from '@dtos/friendship/addFriendInput.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';

export class UserRelationshipController {
   constructor(private readonly _sendFriendRequest: SendFriendRequest) {}

   sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = sendFriendRequestInputSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._sendFriendRequest.execute(parsed.data);

         res.status(200).json({ success: true, message: 'Friend request send', data: result });
      } catch (error) {
         next(error);
      }
   };
}
