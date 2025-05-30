export type SentEmailEvent<T, E = String> = {
   email: string;
   data: T;
   type: E;
};
