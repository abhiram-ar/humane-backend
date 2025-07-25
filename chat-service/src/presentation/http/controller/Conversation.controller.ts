import {
   CreateConversationInputDTO,
   createConversationSchema,
} from '@application/dto/CreateConversation.dto';
import {
   GetOneToOneConversationInputDTO,
   getOneToOneConversationInputSchema,
} from '@application/dto/GetOneToOneConversation';
import {
   getUserConversaionsInputSchema,
   GetUserConversationInputDTO,
} from '@application/dto/GetUserConversations.dto';
import { BasicUserDetails } from '@application/Types/BasicUserDetails.type';
import { IElasticSearchProxyService } from '@ports/services/IElasticSearchProxyService';
import { IFindOtherParticipantOfOneToOneConvo } from '@ports/usecases/IFindOtherParticipantOfOneToOneConvo';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';
import {
   getUserConvoByIdInputSchema,
   GetUserCovoByIdInputDTO,
} from '@application/dto/GetUserConversationById.dto';

export class ConversationController {
   constructor(
      private readonly _conversationServices: IConversationServices,
      private readonly _findOtherParticipantOfOneToOneConvo: IFindOtherParticipantOfOneToOneConvo,
      private readonly _ESproxyService: IElasticSearchProxyService
   ) {}

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
         const { pagination, conversations } = await this._conversationServices.getUserConversation(
            validtedDTO.data
         );

         const OneToOneConversationByParticipants = conversations
            .filter((convo) => convo.type === 'one-to-one')
            .map((convo) => convo.participants);

         const otherUserIds = OneToOneConversationByParticipants.map((participants) =>
            this._findOtherParticipantOfOneToOneConvo.execute(participants, validtedDTO.data.userId)
         );

         const basicUserDetails = await this._ESproxyService.getUserBasicDetails(otherUserIds);
         const userIdToTheirBasicDetailsMap = new Map<string, BasicUserDetails>();
         basicUserDetails.forEach((details) => {
            if (!details) return;
            userIdToTheirBasicDetailsMap.set(details.id, details);
         });

         const conversationWithParticipantHydrationForOneToOneConvo = conversations.map((convo) => {
            const otherUserId = this._findOtherParticipantOfOneToOneConvo.execute(
               convo.participants,
               validtedDTO.data.userId
            );

            if (!userIdToTheirBasicDetailsMap.has(otherUserId)) {
               return convo;
            }

            return { ...convo, otherUser: userIdToTheirBasicDetailsMap.get(otherUserId) };
         });

         res.status(HttpStatusCode.Ok).json({
            data: {
               conversations: conversationWithParticipantHydrationForOneToOneConvo,
               pagination,
            },
         });
      } catch (error) {
         next(error);
      }
   };

   getOneToOneConversation = async (req: Request, res: Response, next: NextFunction) => {
      try {
         console.log('hit');
         if (!req.user || req.user.type !== 'user') throw new UnAuthenticatedError();

         const { otherUserId } = req.query;

         const dto: GetOneToOneConversationInputDTO = {
            participants: [req.user.userId, otherUserId as string],
         };

         const { data, error, success } = getOneToOneConversationInputSchema.safeParse(dto);
         if (!success) {
            throw new ZodValidationError(error);
         }

         const conversation =
            await this._conversationServices.getOneToOneConversationByParticipantIds(
               data.participants
            );

         res.status(HttpStatusCode.Ok).json({ data: { conversation } });
      } catch (error) {
         next(error);
      }
   };

   getUserConvoById = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') throw new UnAuthenticatedError();

         const { convoId } = req.params;

         const dto: GetUserCovoByIdInputDTO = {
            userId: req.user.userId,
            convoId: convoId,
         };

         const validatedDTO = getUserConvoByIdInputSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const result = await this._conversationServices.getUserConversationById(dto);

         res.status(HttpStatusCode.Ok).json({ data: { convo: result } });
      } catch (error) {
         next(error);
      }
   };
}
