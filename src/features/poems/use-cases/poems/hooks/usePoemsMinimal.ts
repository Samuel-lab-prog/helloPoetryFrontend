import { useQuery } from '@tanstack/react-query';
import type { FullPoemType } from '@root/features/poems';
import { api } from '@root/core/api';

type UsePoemsMinimalOptions = {
	limit?: number;
};

export function usePoemsMinimal({ limit = 150 }: UsePoemsMinimalOptions = {}) {
	const query = useQuery({
		queryKey: ['poems-minimal', { limit }],
		staleTime: 1000 * 60 * 30,
		queryFn: () => api.poems.getMyPoems.query().queryFn() as Promise<FullPoemType[]>,
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
