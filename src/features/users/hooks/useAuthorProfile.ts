import { useQuery } from '@tanstack/react-query';
import type { AuthorProfileType } from '../../poems/types';
import { api, apiKeys } from '@root/core/api';

export function useAuthorProfile(authorId: number) {
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;

	const query = useQuery({
		queryKey: apiKeys.users.profile(String(authorId)),
		enabled: isValidAuthorId,
		retry: 2,
		staleTime: 1000 * 60 * 10,
		queryFn: () =>
			api.users.getProfile.query(String(authorId)).queryFn() as Promise<AuthorProfileType>,
	});

	return {
		author: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
