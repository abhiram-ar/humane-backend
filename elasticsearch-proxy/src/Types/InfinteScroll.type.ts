export type InfiniteScrollParams = {
   hasMore: boolean;
   cursor: number | null;
};

export type InfiniteScrollParamsV2 = {
   hasMore: boolean;
   from: string | null;
};
