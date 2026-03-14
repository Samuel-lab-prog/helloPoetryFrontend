import { useQuery } from '@tanstack/react-query';
import { api, apiKeys } from '@root/core/api';

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
		queryKey: apiKeys.users.search({
			limit,
			orderBy: 'nickname',
			orderDirection: 'asc',
			searchNickname: normalizedSearch || undefined,
		}),
		queryFn: () =>
			api.users.getUsers
				.query({
					limit,
					orderBy: 'nickname',
					orderDirection: 'asc',
					searchNickname: normalizedSearch || undefined,
				})
				.queryFn() as Promise<UsersPage>,
	});

	return {
		poets: query.data?.users ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
