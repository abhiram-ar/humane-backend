export type GetFullFriendsResponse = {
   message: string;
   data: { isHotUser: true } | { isHotUser: false; friends: string[] };
};
