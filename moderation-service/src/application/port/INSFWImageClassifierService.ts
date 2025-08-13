import { Prediction } from '@domain/Prediction';
export interface INSFWJSImageClassifierService {
   classify<T extends string>(dto: { absImagePath: string }): Promise<Prediction<T>[] | null>;
}
