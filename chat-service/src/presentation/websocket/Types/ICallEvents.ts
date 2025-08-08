export interface IServerToClientCallEvents {
   'call.incoming': (event: { callerId: string; callId: string }) => void;

   'call.answered.by_other_device': (event: { callId: string; callerId: string }) => void;

   'call.connected': (event: { callId: string; recipientId: string }) => void;

   'call.sdp.offer': (event: { callId: string; offerSDP: string }) => void;

   'call.sdp.answer': (event: { callId: string; answerSDP: string }) => void;
}

export interface IClientToServerCallEvents {
   'call.requested': (event: {
      recipientId: string;
      callback: (res: { ringing: boolean; callId: string }) => void;
   }) => void;

   'call.action': (event: { callId: string; action: 'answered' | 'declined' | 'timeout' }) => void;

   'call.sdp.offer': (event: { callId: string; offerSDP: string }) => void;

   'call.sdp.answer': (event: { callId: string; answerSDP: string }) => void;
}
