import {
   MutualFriendsCountInputDTO,
   MutualFriendsListInputDTO,
   MutualFriendsListOutputDTO,
} from '@dtos/friendship/MutualFriends.dto';
export interface IMutualFriends {
   list(dto: MutualFriendsListInputDTO): Promise<MutualFriendsListOutputDTO>;
   count(dto: MutualFriendsCountInputDTO): Promise<number>;
}
