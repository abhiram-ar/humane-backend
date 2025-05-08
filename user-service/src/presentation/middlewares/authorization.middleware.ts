import { AuthorizationError } from '@application/errors/AuthorizationError';
import { JWTTokenPaylodTypeField } from '@application/types/JWTTokenPayload.type';
import { Request, Response, NextFunction } from 'express';

export const authorizedRoles = (...roles: (JWTTokenPaylodTypeField | '')[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user?.type || '')) {
         throw new AuthorizationError(`${req.user?.type} cannot access this resource`);
      }
      next();
   };
};
