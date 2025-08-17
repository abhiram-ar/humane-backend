import { Prediction } from '@domain/Prediction';
export interface INSFWJSImageClassifierService<T extends string> {
   classify(dto: { absImagePath: string }): Promise<Prediction<T>[] | null>;
}
