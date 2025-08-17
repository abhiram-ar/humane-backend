export type Prediction<T extends string> = {
   className: T;
   probability: number;
};
