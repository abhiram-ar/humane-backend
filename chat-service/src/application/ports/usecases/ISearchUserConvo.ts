import {
   SearchUserConvoInputDTO,
   SearchUserConvoOutputDTO,
} from '@application/dto/SearchUserConvo.dto';

export interface ISearchUserCovo {
   execute(dto: SearchUserConvoInputDTO): Promise<SearchUserConvoOutputDTO>;
}
