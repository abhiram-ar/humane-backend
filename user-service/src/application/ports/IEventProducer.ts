import { AppEvent } from 'humane-common';

export interface IEventPublisher {
   send(topic: string, event: AppEvent): Promise<{ ack: boolean }>;
}
