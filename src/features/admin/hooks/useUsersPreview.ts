import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';

type UserPreview = {
	id: number;
	nickname: string;
	avatarUrl: string | null;
	role: string;
};

type UsersPage = {
	users: UserPreview[];
	nextCursor?: number;
	hasMore: boolean;
};

export function useUsersPreview() {
	const query = useQuery({
		queryKey: ['users-preview'],
		queryFn: () =>
			createHTTPRequest<UsersPage>({
				path: '/users',
				query: {
					limit: 50,
					orderBy: 'nickname',
					orderDirection: 'asc',
				},
			}),
	});

	return {
		users: query.data?.users ?? [],
		isLoadingUsers: query.isLoading,
		isUsersError: query.isError,
	};
}
