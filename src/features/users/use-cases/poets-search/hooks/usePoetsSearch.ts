import { useQuery } from '@tanstack/react-query';

import { users } from '../../../api/endpoints';
import type { UsersPage } from '../../../public/types';

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
