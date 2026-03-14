import { useQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';

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
			api.users.getUsers
				.query({
					limit: 50,
					orderBy: 'nickname',
					orderDirection: 'asc',
				})
				.queryFn() as Promise<UsersPage>,
	});

	return {
		users: query.data?.users ?? [],
		isLoadingUsers: query.isLoading,
		isUsersError: query.isError,
	};
}
