import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';

export type PoetPreview = {
	id: number;
	nickname: string;
	avatarUrl: string | null;
	role: string;
};

export type UsersPage = {
	users: PoetPreview[];
	nextCursor?: number;
	hasMore: boolean;
};

export function usePoetsSearch(searchNickname: string, limit = 10) {
	const normalizedSearch = searchNickname.trim();

	const query = useQuery({
		queryKey: ['poets-search', normalizedSearch, limit],
		queryFn: () =>
			createHTTPRequest<UsersPage>({
				path: '/users',
				query: {
					limit,
					orderBy: 'nickname',
					orderDirection: 'asc',
					searchNickname: normalizedSearch || undefined,
				},
			}),
	});

	return {
		poets: query.data?.users ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
