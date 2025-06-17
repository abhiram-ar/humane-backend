
export interface IIsHotUser {
   execute(userId: string): Promise<boolean | null>;
}
