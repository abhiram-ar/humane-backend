import { Types } from 'mongoose';
export const isValidObjectId = (id: string): boolean => {
   // strict checking
   // Types.ObjectId.isValid("123") will we valid as it can be coherced to objectId
   // so we are going a second check if it is 24-char hex string
   return Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id;

   // additional notes:
   // const id = '123';
   // const objectId = new mongoose.Types.ObjectId(id);

   // console.log(objectId.toString()); // '000000000000000000000123'
   // MongoDB "pads" or "extends" the input to make it a valid ObjectId.
   // That's dangerous if you're validating user input, because "123" isn't a real Mongo ObjectId.
};
