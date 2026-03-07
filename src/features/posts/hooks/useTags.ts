import { useQuery } from '@tanstack/react-query';
import type { TagType } from '../types/types';

export function useTags() {
	const query = useQuery({
		queryKey: ['tags'],
		staleTime: 1000 * 60 * 30,
		queryFn: async () => [] as TagType[],
	});

	return {
		tags: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
