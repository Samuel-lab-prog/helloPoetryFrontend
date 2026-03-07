import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPostType } from '../types/types';

export function usePost(id: number) {
	const query = useQuery({
		queryKey: ['post', id],
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		enabled: !!id,
		queryFn: () =>
			createHTTPRequest<FullPostType>({ path: '/posts', params: [id] }),
	});
	return {
		post: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
