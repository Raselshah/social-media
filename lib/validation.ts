import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().trim().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const CreatePostSchema = z.object({
  content: z.string().trim().min(1, 'Post content is required').max(5000),
  imageUrl: z.string().url().optional().or(z.literal('')).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export const UpdatePostSchema = z.object({
  content: z.string().trim().min(1, 'Post content is required').max(5000),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export const CreateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
  postId: z.string().cuid(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
});

export const CreateReplySchema = z.object({
  content: z.string().trim().min(1, 'Reply cannot be empty').max(1000),
  commentId: z.string().cuid(),
});

export const UpdateReplySchema = z.object({
  content: z.string().trim().min(1, 'Reply cannot be empty').max(1000),
});

export const IdSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type CreateReplyInput = z.infer<typeof CreateReplySchema>;
export type UpdateReplyInput = z.infer<typeof UpdateReplySchema>;
