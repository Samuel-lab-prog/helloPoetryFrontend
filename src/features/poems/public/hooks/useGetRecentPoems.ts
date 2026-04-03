import { poems } from '@root/features/poems/api/endpoints';
import { useQuery } from '@tanstack/react-query';

type UseRecentPoemsOptions = {
	limit?: number;
};

export function useRecentPoems({ limit = 4 }: UseRecentPoemsOptions) {
	const query = useQuery({
		...poems.getPoems.query({
			limit,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		}),
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
	});

	return {
		poems: query.data?.poems ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
