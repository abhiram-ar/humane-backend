export const demoUsers = Array.from({ length: 20 }, (_, i) => ({
   firstName: `User${i + 1}`,
   lastName: `Last${i + 1}`,
   bio: `This is a bio for user ${i + 1}`,
   avatarKey: `avatars/user${i + 1}.jpg`,
   coverPhotoKey: `covers/user${i + 1}.jpg`,
   createdAt: new Date(Date.now() - i * 100000000).toISOString(),
   updatedAt: new Date(Date.now() - i * 50000000).toISOString(),
   lastLoginTime: new Date(Date.now() - i * 10000000).toISOString(),
   isBlocked: i % 7 === 0, // Every 7th user is blocked
   isHotUser: i % 3 === 0, // Every 3rd user is a hot user
   humaneScore: Math.floor(Math.random() * 100), // Score between 0 and 99
}));
