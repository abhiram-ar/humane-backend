import { CreatePostDTO, createPostSchema } from '@application/dtos/CreatePost.dto';
import { DeletePostDTO, deletePostSchema } from '@application/dtos/DeletePost.dto';
import {
   GeneratePresignedURLInputDTO,
   generatePresignedURLSchema,
} from '@application/dtos/generatePresingedURL.dto';
import { StorageError } from '@application/errors/StorageError';
import { logger } from '@config/logget';
import { IEventPublisher } from '@ports/IEventProducer';
import { IPostService } from '@ports/IPostService';
import { IStorageService } from '@ports/IStorageService';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UnAuthenticatedError,
   ZodValidationError,
} from 'humane-common';

export class PostController {
   constructor(
      private readonly _postService: IPostService,
      private readonly _eventPubliser: IEventPublisher,
      private readonly _storageService: IStorageService
   ) {}

   createPost = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not in req header');
         }

         const dto: CreatePostDTO = {
            authorId: req.user.userId,
            ...req.body,
         };

         const parsed = createPostSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const createdPost = await this._postService.create(parsed.data);

         const postCreatedEvent = createEvent(AppEventsTypes.POST_CREATED, createdPost);

         const { ack } = await this._eventPubliser.send(
            MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
            postCreatedEvent
         );

         if (!ack) {
            logger.warn(`post ${createdPost.id} created event not publised in eventbus`);
         }

         res.status(HttpStatusCode.Created).json({
            message: 'post created',
            data: { post: createdPost },
         });
      } catch (error) {
         next(error);
      }
   };

   deletePost = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not in req header');
         }

         const dto: DeletePostDTO = {
            authorId: req.user.userId,
            postId: req.params.postId,
         };

         const parsed = deletePostSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const deltedPost = await this._postService.delete(parsed.data);

         const postDeltedEvent = createEvent(AppEventsTypes.POST_DELETED, deltedPost);
         const { ack } = await this._eventPubliser.send(
            MessageBrokerTopics.POST_DELETED_EVENTS_TOPIC,
            postDeltedEvent
         );

         if (!ack) {
            logger.warn(`post ${deltedPost.id} deleted event not publised in eventbus`);
         }

         res.status(HttpStatusCode.Accepted).json({
            message: 'post deleted',
            data: { post: deltedPost },
         });
      } catch (error) {
         next(error);
      }
   };

   getPresingedPosterURL = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not found in req header');
         }

         const dto: GeneratePresignedURLInputDTO = {
            userId: req.user.userId,
            fileName: req.body.fileName,
            fileType: req.body.fileType,
         };
         const { data, success, error } = generatePresignedURLSchema.safeParse(dto);
         if (!success) {
            throw new ZodValidationError(error);
         }

         const result = await this._storageService.generatePreSignedURL(
            data.userId,
            data.fileName,
            data.fileType
         );
         if (!result) throw new StorageError('unable to create pre-signedURL');

         res.status(HttpStatusCode.Created).json({
            message: 'post poster presignedURL genrated',
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };
}
