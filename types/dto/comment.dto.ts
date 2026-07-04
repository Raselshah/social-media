import { PublicUserDto } from '@/types/dto/auth.dto';

export interface CommentDto {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: PublicUserDto;
  createdAt: Date;
  updatedAt: Date;
  likedByCurrentUser?: boolean;
  likeCount?: number;
  likedUsers?: PublicUserDto[];
  replies?: ReplyDto[];
}

export interface ReplyDto {
  id: string;
  content: string;
  commentId: string;
  authorId: string;
  author: PublicUserDto;
  createdAt: Date;
  updatedAt: Date;
  likedByCurrentUser?: boolean;
  likeCount?: number;
  likedUsers?: PublicUserDto[];
}

export interface CreateCommentDto {
  content: string;
}

export interface CreateReplyDto {
  content: string;
}
