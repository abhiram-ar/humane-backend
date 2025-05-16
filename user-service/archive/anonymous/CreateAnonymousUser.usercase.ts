/* eslint-disable */
/* tslint:disable */
export class CreateAnonymousUser {
   constructor(
      private readonly _anonUserRepository: IAnonymousUserRepository,
      private readonly _UUIDService: IUUIDService
   ) {}

   execute = async (userId: string): Promise<Anonymous> => {
      const newAnon = new Anonymous(
         this._UUIDService.generate(),
         userId,
         Date.now() + Anonymous.ANON_EXPIRY_TIME_IN_MILLI_SECONDS,
         Date.now()
      );

      const anon = await this._anonUserRepository.create(newAnon);
      return anon;
   };
}
