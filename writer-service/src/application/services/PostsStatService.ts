import { PostStatsOutputDTO } from '@application/Types/PostsStat.dto';
import { IPostRepository } from '@domain/repository/IPostRepository';
import { IPostsStats } from '@ports/IPostsStatService';

export class PostsStats implements IPostsStats {
   constructor(private readonly _postRepo: IPostRepository) {}

   execute = async (): Promise<PostStatsOutputDTO> => {
      const totalPosts = await this._postRepo.getPostCount();

      const last24hrsAgo = new Date();
      last24hrsAgo.setTime(last24hrsAgo.getTime() - 1000 * 60 * 60 * 24);
      const newPostInLast24hrs = await this._postRepo.getPostCount(last24hrsAgo);

      const last48hrsAgo = new Date();
      last48hrsAgo.setTime(last24hrsAgo.getTime() - 1000 * 60 * 60 * 24);
      const newPostInLast48hrs = await this._postRepo.getPostCount(last48hrsAgo);

      return { newPosts: { newPostInLast24hrs, newPostInLast48hrs }, totalPosts };
   };
}
