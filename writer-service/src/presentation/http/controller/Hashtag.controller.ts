import {
   hashtagPrefixSearchInputDTO,
   hashtagPrefixSearchSchema,
} from '@application/dtos/HashTagPrefixSearch.dto';
import { IHashtagServices } from '@ports/IHashtagServices';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
export class HashtagController {
   constructor(private readonly _hashtagServices: IHashtagServices) {}

   prefixSearch = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { query, limit } = req.query;

         const dto: hashtagPrefixSearchInputDTO = {
            query: query as string,
            limit: limit ? parseInt(limit as string) : 6,
         };

         const validatedDTO = hashtagPrefixSearchSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const hashtags = await this._hashtagServices.prefixQuery(dto);

         res.status(HttpStatusCode.Ok).json({ data: { hashtags } });
      } catch (error) {
         next(error);
      }
   };
}
