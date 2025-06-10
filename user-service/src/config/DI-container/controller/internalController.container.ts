import { getFriends } from '@di/usecase/friendshipUsercase.container';
import { isHotUser } from '@di/usecase/userUsercase.container';
import { InternalController } from '@presentation/controllers/internal.controller';

export const internalController = new InternalController(isHotUser, getFriends);
