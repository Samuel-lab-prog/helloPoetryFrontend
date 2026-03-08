import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPoemType } from '../types';

export function useMyPoems(enabled = true) {
	const query = useQuery({
		queryKey: ['my-poems'],
		enabled,
		staleTime: 1000 * 60 * 5,
		queryFn: () => createHTTPRequest<FullPoemType[]>({ path: '/poems/me' }),
	});

	return {
		poems: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
