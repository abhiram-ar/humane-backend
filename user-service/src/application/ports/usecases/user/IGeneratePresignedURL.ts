import { GeneratePresignedURLInputDTO } from '@dtos/user/generatePreSignedURL.input.dto';

export interface IGeneratePresignedURL {
   execute(dto: GeneratePresignedURLInputDTO): Promise<string>;
}
