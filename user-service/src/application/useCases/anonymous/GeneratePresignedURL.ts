import { StorageError } from '@application/errors/StorageError';
import { GeneratePresignedURLInputDTO } from '@dtos/anonymous/generatePreSignedURL.input.dto';
import { IStorageService } from '@ports/IStorageService';

// move this to common use case
export class GeneratePresignedURL {
   constructor(private readonly _storageSerice: IStorageService) {}

   execute = async (dto: GeneratePresignedURLInputDTO): Promise<string> => {
      const presignedURL = await this._storageSerice.generatePreSignedURL(
         dto.fileName,
         dto.mimeType
      );

      if (!presignedURL) {
         throw new StorageError('failed to create presinged url.');
      }

      return presignedURL;
   };
}
