export interface IServerToClientCallEvents {
   'call.incoming': (event: { callerId: string; callId: string; at: string }) => void;

   'call.incoming.cancelled': (event: { callerId: string; callId: string }) => void;

   'call.acted.by_other_device': (event: { callId: string; callerId: string }) => void;

   'call.connected': (event: { callId: string; recipientId: string }) => void;

   'call.declined': (event: { callId: string; recipientId: string }) => void;

   'call.sdp.offer': (event: { callId: string; offerSDP: string }) => void;

   'call.sdp.answer': (event: { callId: string; answerSDP: string }) => void;

   'call.ended': (event: { callId: string; at: string }) => void;
}

export interface IClientToServerCallEvents {
   'call.initiate': (
      recipientId: string,
      callback: (
         res: { ringing: boolean; callId: string } | { ringing: false; error: string }
      ) => void
   ) => void;

   'call.handup': (event: { callId: string }) => void;

   'call.action': (
      event: { callId: string; action: 'answered' | 'declined' | 'timeout' },
      callback: (arg: { status: 'connected' | 'callTakenOnOtherDevice' | 'callEnded' }) => void
   ) => void;

   'call.sdp.offer': (event: { callId: string; offerSDP: string }) => void;

   'call.sdp.answer': (event: { callId: string; answerSDP: string }) => void;
}
