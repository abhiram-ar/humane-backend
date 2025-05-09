import { SentEmailEvent } from "@application/types/SentEmailEvent.type";

export interface IEmailService {
   send(event: SentEmailEvent<any>): Promise<{ ack: boolean }>;
}
