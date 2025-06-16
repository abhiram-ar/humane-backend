export const stringifyUnifiedCursor = (createdAt: Date, postId: string) => {
   return [createdAt.getTime(), postId].join('|');
};

export const parseUnifiedCursor = (cursorStr: string) => {
   const [createdAtStr, lastPostId] = cursorStr.split('|');
   const createdAt = new Date(parseInt(createdAtStr));
   return { createdAt, lastPostId };
};
