export class OTP {
   generate(length = 6): string {
      const otp = Math.floor((1 + Math.random() * 9) * Math.pow(10, length - 1));
      return String(otp);
   }
}
