// User & Auth Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Post Types
export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  privacy?: 'PUBLIC' | 'PRIVATE';
  visibility?: 'PUBLIC' | 'PRIVATE';
  likedByCurrentUser?: boolean;
  likeCount?: number;
  commentCount?: number;
  likedUsers?: PublicUser[];
  authorId: string;
  author: User | PublicUser;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
  likes?: Like[];
  postLikes?: Like[];
  _count?: {
    comments: number;
    likes?: number;
    postLikes?: number;
  };
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: User | PublicUser;
  createdAt: Date;
  updatedAt: Date;
  replies?: Reply[];
  likedByCurrentUser?: boolean;
  likeCount?: number;
  likedUsers?: PublicUser[];
  likes?: Like[];
  _count?: {
    replies: number;
    likes: number;
  };
}

// Reply Types
export interface Reply {
  id: string;
  content: string;
  commentId: string;
  authorId: string;
  author: User | PublicUser;
  createdAt: Date;
  updatedAt: Date;
  likes?: Like[];
  likedByCurrentUser?: boolean;
  likeCount?: number;
  likedUsers?: PublicUser[];
  _count?: {
    likes: number;
  };
}

// Like Types
export interface Like {
  id: string;
  userId: string;
  postId?: string | null;
  commentId?: string | null;
  replyId?: string | null;
  createdAt: Date;
}

// Pagination
export interface PaginationParams {
  cursor?: string;
  take?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  hasMore: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreatePostFormData {
  content: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  image?: File | null;
}

export interface CreateCommentFormData {
  content: string;
}

export interface CreateReplyFormData {
  content: string;
}
