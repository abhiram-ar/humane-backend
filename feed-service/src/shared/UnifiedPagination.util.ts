export const stringifyUnifiedCursor = (createdAt: Date | number, postId: string) => {
   const createdAtNum = typeof createdAt === 'number' ? createdAt : createdAt.getTime();
   return [createdAtNum, postId].join('|');
};

export const parseUnifiedCursor = (cursorStr: string) => {
   const [createdAtStr, lastPostId] = cursorStr.split('|');
   const createdAt = new Date(parseInt(createdAtStr));
   return { createdAt, lastPostId };
};
