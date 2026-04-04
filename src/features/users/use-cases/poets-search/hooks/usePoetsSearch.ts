import { users } from '@Api/users/endpoints';
import type { UsersPage } from '@Api/users/types';
import { useQuery } from '@tanstack/react-query';

export function usePoetsSearch(searchNickname: string, limit = 10) {
	const normalizedSearch = searchNickname.trim();

	const query = useQuery<UsersPage>({
		...users.getPublicUsers.query({
			limit,
			searchNickname: normalizedSearch || undefined,
		}),
	});

	return {
		poets: query.data?.users ?? [],
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
	};
}
