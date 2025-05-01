import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../application/errors/AppError.abstract';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): any => {
   if (err instanceof AppError) {
      return res.status(err.statusCode).json({ success: false, errors: err.serialize() });
   }

   // user better error loging
   console.log(err);
   return res.status(500).json({ success: false, errors: [{ message: 'someting went wrong' }] });
};
