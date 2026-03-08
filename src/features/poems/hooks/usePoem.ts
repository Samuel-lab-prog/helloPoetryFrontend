import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPoemType } from '../types';

export function usePoem(id: number) {
	const query = useQuery({
		queryKey: ['poem', id],
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		enabled: !!id,
		queryFn: () =>
			createHTTPRequest<FullPoemType>({ path: '/poems', params: [id] }),
	});
	return {
		poem: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
