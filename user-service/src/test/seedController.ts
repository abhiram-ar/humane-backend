import { userRepository } from '@di/repository.container';
import { Request, Response, NextFunction } from 'express';
import { demoUsers } from './seedUsers';
import { createUserDTO } from '@application/DTO-mapper/user/createUser.dto';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UserCreatedEventPayload,
} from 'humane-common';
import { kafkaPubliserService } from '@di/services.container';

export const seedUser = (req: Request, res: Response, next: NextFunction) => {
   try {
      demoUsers.forEach(async (user) => {
         const dto: createUserDTO = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: '$2b$10$7C.zWjH5fhRZ8y.5kUa7Su1ifry40aG1E3PKZgIaR0X5R58lQGBBC', //12345678 hash
         };
         const newUser = await userRepository.create(dto);

         const eventPayload: UserCreatedEventPayload = {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName || null,
            createdAt: newUser.createdAt,
            isBlocked: newUser.isBlocked,
            isHotUser: newUser.isHotUser,
            bio: newUser.bio ?? null,
            avatarKey: newUser.avatarKey ?? null,
            coverPhotoKey: newUser.coverPhotoKey ?? null,
            lastLoginTime: newUser.lastLoginTime ?? null,
            humaneScore: newUser.humaneScore,
         };

         const userCreatedEvent = createEvent(AppEventsTypes.USER_CREATED, eventPayload);
         const { ack } = await kafkaPubliserService.send(
            MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
            userCreatedEvent
         );

         if (!ack) {
            console.log(`error pulbishing ${newUser.id} : ${newUser.firstName}`);
         }
      });
      res.status(200).json({ message: 'users-seeed' });
   } catch (error) {
      next(error);
   }
};
