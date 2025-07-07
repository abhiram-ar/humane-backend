import { io } from '../ws';

export const isUserOnline = async (userId: string) => {
   const reciverSockets = await io.in(userId).fetchSockets();
   return reciverSockets.length > 0 ? true : false;
};
