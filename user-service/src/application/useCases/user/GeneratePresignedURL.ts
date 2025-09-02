import { StorageError } from '@application/errors/StorageError';
import { GeneratePresignedURLInputDTO } from '@application/DTO-mapper/user/generatePreSignedURL.input.dto';
import { IStorageService } from '@ports/IStorageService';
import { IGeneratePresignedURL } from '@ports/usecases/user/IGeneratePresignedURL';

// move this to common use case
export class GeneratePresignedURL implements IGeneratePresignedURL {
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
