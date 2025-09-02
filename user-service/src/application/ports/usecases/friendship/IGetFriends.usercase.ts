import {
   GetFriendCountInputDTO,
   GetFriendListInputDTO,
   GetFriendListOutputDTO,
} from '@application/DTO-mapper/friendship/GetFriends.dto';

export interface IGetFriends {
   list(dto: GetFriendListInputDTO): Promise<GetFriendListOutputDTO>;
   count(dto: GetFriendCountInputDTO): Promise<number>;
   allFriends(userId: string): Promise<string[]>;
}
