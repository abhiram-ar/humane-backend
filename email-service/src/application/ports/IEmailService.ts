
export interface IEmailService {
   send(email: string, subject: string, data: any, template: string): Promise<{ ack: boolean }>;
}
