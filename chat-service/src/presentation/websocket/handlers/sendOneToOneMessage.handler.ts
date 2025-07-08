import {
   CreateOneToOneMessageInputDTO,
   createOneToOneMessageSchema,
} from '@application/dto/CreateOneToOneMessage.dto';
import { oneToOneMessageServices } from '@di/usecases.container';
import { ZodValidationError } from 'humane-common';
import { TypedSocket } from '../Types/TypedSocket';

export const sendOneToOneMessageHandler = async (
   socket: TypedSocket,
   event: Omit<CreateOneToOneMessageInputDTO, 'from'>
) => {
   try {
      const validatedDTO = createOneToOneMessageSchema.safeParse({ ...event, from: 'enthoo' });
      if (!validatedDTO.success) {
         throw new ZodValidationError(validatedDTO.error);
      }

      const res = await oneToOneMessageServices.create(validatedDTO.data);

      socket.emit('test', res);
   } catch (e) {
      console.log('error while one to one message');
      console.log(e);
   }
};
