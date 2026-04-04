import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import type { UserPublicProfile } from '@Api/users/types';
import { useQuery } from '@tanstack/react-query';

export function useAuthorProfile(authorId: number) {
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;

	const query = useQuery({
		queryKey: userKeys.profile(String(authorId)),
		enabled: isValidAuthorId,
		retry: 2,
		staleTime: 1000 * 60 * 10,
		queryFn: () => users.getProfile.query(String(authorId)).queryFn() as Promise<UserPublicProfile>,
	});

	return {
		author: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
