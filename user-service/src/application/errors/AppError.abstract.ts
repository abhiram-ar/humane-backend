export abstract class AppError extends Error {
   public abstract statusCode: number;

   constructor(public message: string) {
      super(message);

      // the prototype chain isn't always set up correctly — especially in older versions of JavaScript or when targeting ES5
      // fix for
      // - error instanceOf AppError => false
      Object.setPrototypeOf(this, AppError.prototype);
   }

   abstract serialize(): { message: string; field?: string }[];
}
