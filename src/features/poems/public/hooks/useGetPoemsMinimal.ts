import { poems } from '@features/poems/api/endpoints';
import { useQuery } from '@tanstack/react-query';

type UsePoemsMinimalOptions = {
	limit?: number;
};

export function usePoemsMinimal({ limit = 150 }: UsePoemsMinimalOptions = {}) {
	const query = useQuery({
		...poems.getMyPoems.query(),
		staleTime: 1000 * 60 * 30,
	});

	const minimalPoems = (query.data ?? []).slice(0, limit).map((poem) => ({
		id: poem.id,
		title: poem.title,
	}));

	return {
		poems: minimalPoems,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
