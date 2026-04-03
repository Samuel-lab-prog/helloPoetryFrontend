import { users } from '@features/users/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export function useUsersPreview() {
	const query = useQuery({
		...users.getUsersPreview.query({
			limit: 50,
		}),
		staleTime: 5 * 60 * 1000,
	});

	return {
		users: query.data?.users ?? [],
		isLoadingUsers: query.isLoading,
		isUsersError: query.isError,
	};
}
