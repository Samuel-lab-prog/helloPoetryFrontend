import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPoemType } from '@features/posts';

type UsePostsMinimalOptions = {
	limit?: number;
};

export function usePostsMinimal({ limit = 150 }: UsePostsMinimalOptions = {}) {
	const query = useQuery({
		queryKey: ['poems-minimal', { limit }],
		staleTime: 1000 * 60 * 30,
		queryFn: () => createHTTPRequest<FullPoemType[]>({ path: '/poems/me' }),
	});

	const poems = (query.data ?? []).slice(0, limit).map((poem) => ({
		id: poem.id,
		title: poem.title,
	}));

	return {
		poems,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
