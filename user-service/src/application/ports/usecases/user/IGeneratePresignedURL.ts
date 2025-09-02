import { GeneratePresignedURLInputDTO } from '@application/DTO-mapper/user/generatePreSignedURL.input.dto';

export interface IGeneratePresignedURL {
   execute(dto: GeneratePresignedURLInputDTO): Promise<string>;
}
