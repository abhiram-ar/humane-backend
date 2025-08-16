import { AppError } from 'humane-common';

export const WorkerQueueErrorMsg = {
   NO_CHANNEL: 'no consumer channel',
   NO_PRODUCER_CHANNEL: 'no producer channel',
   PRODUCER_MAX_RETRY_REACED: 'producer max retry reached',
} as const;

export class WorkerQueueError extends AppError {
   public statusCode = 500;
   constructor(public message: (typeof WorkerQueueErrorMsg)[keyof typeof WorkerQueueErrorMsg]) {
      super(message);
      Object.setPrototypeOf(this, WorkerQueueError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
