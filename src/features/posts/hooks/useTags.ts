import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { TagType } from '../types/types';

export function useTags() {
	const query = useQuery({
		queryKey: ['tags'],
		staleTime: 1000 * 60 * 30,
		retry: 3,
		queryFn: () =>
			createHTTPRequest<TagType[]>({
				path: '/posts/tags',
			}),
	});

	return {
		tags: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
