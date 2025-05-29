import { friendshipRepository, userRepository } from '@di/repository.container';
import { Friendship } from '@domain/entities/friendship.entity';
import { GetUserDTO } from '@dtos/admin/getUsers.dto';
import { Request, Response, NextFunction } from 'express';

export const sendBulkFriendReq = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { targetUserId, maxReq } = req.body;
      if (!targetUserId) throw new Error('targerUserId missign in request');
      if (!maxReq || typeof maxReq !== 'number' || maxReq < 0)
         throw new Error('Invalid max req no.');

      const dto: GetUserDTO = {
         page: 1,
         limit: maxReq,
      };
      const users = await userRepository.getUserList({ ...dto, skip: 0 });
      const stats = { sentCount: 0, failed: 0, total: users.users.length };

      const promises = users.users.map(async (user, idx) => {
         console.log(`sending friend req: ${idx + 1}/${stats.total}`);
         const frindship = new Friendship(targetUserId, user.id, 'PENDING');
         return friendshipRepository.addFriendRequest(frindship, user.id, targetUserId);
      });

      const result = await Promise.allSettled(promises);

      result.forEach((result) => {
         if (result.status === 'fulfilled') stats.sentCount = stats.sentCount + 1;
         else stats.failed = stats.sentCount + 1;
      });

      res.status(200).json({ success: true, messsage: 'req send', stats, requestedUsers: users });
   } catch (error) {
      next(error);
   }
};
