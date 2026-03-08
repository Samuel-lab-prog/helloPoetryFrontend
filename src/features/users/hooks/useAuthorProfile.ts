import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { AuthorProfileType } from '../../poems/types';

export function useAuthorProfile(authorId: number) {
  const query = useQuery({
    queryKey: ['author-profile', authorId],
    enabled: !!authorId,
    retry: 2,
    staleTime: 1000 * 60 * 10,
    queryFn: () =>
      createHTTPRequest<AuthorProfileType>({
        path: '/users',
        params: [authorId, 'profile'],
      }),
  });

  return {
    author: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
