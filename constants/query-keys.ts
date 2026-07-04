export const feedKeys = {
  all: ['feed'] as const,
  home: () => [...feedKeys.all, 'home'] as const,
  homeInfinite: () => [...feedKeys.home(), 'infinite'] as const,
};

export const postKeys = {
  all: ['posts'] as const,
  detail: (postId: string) => [...postKeys.all, postId] as const,
  comments: (postId: string) => [...postKeys.detail(postId), 'comments'] as const,
};

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export const profileKeys = {
  detail: (userId: string) => ['profile', userId] as const,
};
