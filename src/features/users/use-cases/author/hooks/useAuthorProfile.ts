import type { AuthorProfileType } from '@root/features/poems/public/types';
import { users } from '@root/features/users/api/endpoints';
import { userKeys } from '@root/features/users/api/keys';
import { useQuery } from '@tanstack/react-query';

export function useAuthorProfile(authorId: number) {
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;

	const query = useQuery({
		queryKey: userKeys.profile(String(authorId)),
		enabled: isValidAuthorId,
		retry: 2,
		staleTime: 1000 * 60 * 10,
		queryFn: () => users.getProfile.query(String(authorId)).queryFn() as Promise<AuthorProfileType>,
	});

	return {
		author: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
