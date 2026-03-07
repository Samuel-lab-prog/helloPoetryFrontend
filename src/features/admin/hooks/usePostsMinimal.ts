import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { PaginatedMinimalPostsType } from '@features/posts';

type UsePostsMinimalOptions = {
	deleted?: 'only' | 'exclude';
	status?: 'published' | 'draft';
	limit?: number;
};
export function usePostsMinimal({
	deleted,
	status,
	limit = 150,
}: UsePostsMinimalOptions) {
	const query = useQuery({
		queryKey: ['posts-minimal', { deleted, status, limit }],
		staleTime: 1000 * 60 * 30, // 30 minutes
		queryFn: () =>
			createHTTPRequest<PaginatedMinimalPostsType>({
				path: '/posts/minimal',
				query: { limit, deleted, status },
			}),
	});

	return {
		posts: query.data?.posts ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
