import { io } from '../ws';

export const getUserSocketsOnlineCount = async (userId: string): Promise<number> => {
   const reciverSockets = await io.in(userId).fetchSockets();
   return reciverSockets.length || 0;
};

export const isUserOnline = async (userId: string) => {
   const userSockets = await getUserSocketsOnlineCount(userId);
   return userSockets > 0 ? true : false;
};

export const isUserHasMulipleSocketConnected = async (userId: string) => {
   const userSocketsOnline = await getUserSocketsOnlineCount(userId);
   return userSocketsOnline > 1 ? true : false;
};
