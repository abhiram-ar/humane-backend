import { IOTP } from '@domain/interfaces/IOtpGenerator';

export class OTP implements IOTP {
   generate(length = 6): string {
      const otp = Math.floor((1 + Math.random() * 9) * Math.pow(10, length - 1));
      return String(otp);
   }
}
