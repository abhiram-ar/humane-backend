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

      users.users.forEach(async (user, idx) => {
         try {
            console.log(`sending: ${idx + 1}/${stats.total}`);
            const frindship = new Friendship(targetUserId, user.id, 'PENDING');
            await friendshipRepository.addFriendRequest(frindship, user.id, targetUserId);
            stats.sentCount++;
         } catch (error) {
            stats.failed++;
         }
      });

      res.status(200).json({ success: true, messsage: 'req send', stats, requestedUsers: users });
   } catch (error) {
      next(error);
   }
};
