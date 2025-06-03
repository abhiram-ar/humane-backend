export interface ServerToClientEvents {
   test: (msg: string) => void;
   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
   hello: () => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
