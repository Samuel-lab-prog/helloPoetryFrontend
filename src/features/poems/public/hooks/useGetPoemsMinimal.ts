import { useQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';

type UsePoemsMinimalOptions = {
	limit?: number;
};

export function usePoemsMinimal({ limit = 150 }: UsePoemsMinimalOptions = {}) {
	const query = useQuery({
		...api.poems.getMyPoems.query(),
		staleTime: 1000 * 60 * 30,
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
