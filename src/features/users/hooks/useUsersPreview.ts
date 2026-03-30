import { useQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';

export function useUsersPreview() {
	const query = useQuery({
		...api.users.getUsersPreview.query({
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
