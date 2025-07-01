import { CreatePostDTO } from '@application/dtos/CreatePost.dto';
import { DeletePostDTO } from '@application/dtos/DeletePost.dto';
import { EntityNotFound } from '@application/errors/EntityNotFoundError';
import { HashTag } from '@domain/entities/hashtag.entity';
import { Post } from '@domain/entities/Post.entity';
import { IPostRepository } from '@domain/repository/IPostRepository';
import { IPostService } from '@ports/IPostService';

export class PostService implements IPostService {
   constructor(private readonly _postRepo: IPostRepository) {}

   create = async (dto: CreatePostDTO): Promise<Required<Post>> => {
      const extractedHashTags = HashTag.extractHashtags(dto.content);

      const post = new Post(
         dto.authorId,
         dto.content,
         dto.visibility,
         extractedHashTags,
         dto.attachmentType,
         dto.attachmentKey
      );

      return await this._postRepo.create(post);
   };

   delete = async (dto: DeletePostDTO): Promise<Required<Post>> => {
      // note: userId is requesd for this request. Else any authenicated user can delte any post

      const deletedPost = await this._postRepo.delete(dto.authorId, dto.postId);
      if (!deletedPost) {
         throw new EntityNotFound(`user does not have post my postId ${dto.postId})`);
      } else return deletedPost;
   };
}
