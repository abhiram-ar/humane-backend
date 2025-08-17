import { AppError } from 'humane-common';

export const fileSystemErrorMessages = {
   NON_EXISTING_RESOURCE: 'No such file or directory',
   PERMISSION_DENIED: 'Permission denied',
   PATH_IS_DIRECTRORY: 'Path is a directory, not a file',
   FILE_OPEN_LIMIT: 'Too many open files',
   RESOURCE_BUSY: 'Resource is busy',
   INVALID_ARGUMENT: 'Invalid argument',
   FILE_ALREAY_EXIST: 'File already exists',
};

export class FileSystemError extends AppError {
   public statusCode = 500;
   constructor(
      public message: (typeof fileSystemErrorMessages)[keyof typeof fileSystemErrorMessages]
   ) {
      super(message);
      Object.setPrototypeOf(this, FileSystemError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
