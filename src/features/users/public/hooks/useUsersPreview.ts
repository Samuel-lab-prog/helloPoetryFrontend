import { users } from '@Api/users/endpoints';
import type { UserPreview } from '@Api/users/types';
import { useQuery } from '@tanstack/react-query';

const EMPTY_USERS: UserPreview[] = [];

export function useUsersPreview({ enabled = true }: { enabled?: boolean } = {}) {
	const query = useQuery({
		...users.getUsersPreview.query({
			limit: 50,
		}),
		enabled,
		staleTime: 5 * 60 * 1000,
	});

	return {
		users: query.data?.users ?? EMPTY_USERS,
		isLoadingUsers: query.isLoading,
		isUsersError: query.isError,
	};
}
