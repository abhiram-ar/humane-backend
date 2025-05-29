export type UserListInfinityScollFromParam = {
   createdAt: string;
   lastId: string;
} | null;

export type UserListInfinityScollParams =
   | (UserListInfinityScollFromParam & {
        hasMore: boolean;
     })
   | null;
