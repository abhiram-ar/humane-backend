import {
   CreateOneToOneMessageInputDTO,
   createOneToOneMessageSchema,
} from '@application/dto/CreateOneToOneMessage.dto';
import { oneToOneMessageServices } from '@di/usecases.container';
import { ZodValidationError } from 'humane-common';
import { TypedSocket } from '../Types/TypedSocket';
import { isUserOnline } from '../utils/isUserOnline';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';

export const sendOneToOneMessageHandler = async (
   socket: TypedSocket,
   event: Omit<CreateOneToOneMessageInputDTO, 'from'>,
   callback: (data: {
      message: AttachementURLHydratedMessage | undefined;
      success: boolean;
   }) => void
) => {
   try {
      const validatedDTO = createOneToOneMessageSchema.safeParse({
         ...event,
         from: socket.data.userId,
      });
      if (!validatedDTO.success) {
         throw new ZodValidationError(validatedDTO.error);
      }

      const message = await oneToOneMessageServices.create(validatedDTO.data);
      if (await isUserOnline(event.to)) {
         socket.to(event.to).emit('new-one-to-one-message', message);
      }
      callback({ message: message, success: true });
   } catch (e) {
      console.log('error while one to one message');
      console.log(e);
      callback({ message: undefined, success: false });
   }
};
