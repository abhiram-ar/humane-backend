import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { verifyAccessToken } from '@di/usecase/commonUsercase.container';
import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      throw new UnAuthenticatedError('No authorization data in request header');
   }

   const token = authHeader.split(' ')[1];
   if (!token) {
      throw new UnAuthenticatedError('No authorization token in request header');
   }

   const payload = verifyAccessToken.execute(token);

   if (payload.type === 'user' || payload.type === 'admin') {
      req.user = payload;
      return next();
   }

   throw new UnAuthenticatedError('Something wrong with authentication');
};
