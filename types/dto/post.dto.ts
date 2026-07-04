import { PublicUserDto, UserDto } from '@/types/dto/auth.dto';

export interface PostDto {
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  authorId: string;
  author: PublicUserDto;
  createdAt: Date;
  updatedAt: Date;
  likedByCurrentUser: boolean;
  likeCount: number;
  commentCount: number;
  likedUsers: PublicUserDto[];
  comments?: CommentPreviewDto[];
}

export interface CommentPreviewDto {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  author: PublicUserDto;
}

export interface CreatePostDto {
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  imageUrl?: string;
}

export interface PaginatedFeedDto<T> {
  data: T[];
  cursor?: string;
  hasMore: boolean;
}

export interface ReactionDto {
  likedByCurrentUser: boolean;
  likeCount: number;
  likedUsers: PublicUserDto[];
}

export type { UserDto, PublicUserDto };
