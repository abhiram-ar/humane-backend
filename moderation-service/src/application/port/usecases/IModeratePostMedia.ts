import { Prediction } from '@domain/Prediction';

export interface IModeratePostMedia<ClassNames extends string> {
   execute(dto: {
      attachmentType: string;
      attachmentKey: string;
      bucketName: string;
      hotClassNames: ClassNames[];
      cleanup?: boolean;
   }): Promise<
      | { success: false }
      | {
           success: true;
           moderdationData:
              | { type: 'singleFrame'; result: Prediction<ClassNames>[] }
              | {
                   type: 'multiFrame';
                   result: {
                      hottestFrame: Prediction<ClassNames>[] | null;
                      hotFrames: Prediction<ClassNames>[][];
                      totalFrames: number;
                   };
                };
           flagged: boolean;
           tempResourceName?: string;
        }
   >;

   cleanup(tempResourceName: string): Promise<void>;
}
