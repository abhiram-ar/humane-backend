import { io } from '@presentation/websocket/ws';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { IAdminController } from '../interfaces/IAdmin.controller';
export class AdminController implements IAdminController {
   getUsersOnline = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const count = (await io.sockets.fetchSockets()).length;
         res.status(HttpStatusCode.Ok).json({ data: { usersOnline: count } });
      } catch (error) {
         next(error);
      }
   };
}
