import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import { useAuthCacheScope } from '@features/auth/public';
import { useQuery } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function usePoem(id: number) {
	const stringId = String(id);
	const authScope = useAuthCacheScope();
	const query = useQuery({
		...poems.getPoem.query(stringId),
		queryKey: poemKeys.byIdForViewer(stringId, authScope),
		retry: (failureCount, error) => shouldRetryPoemQuery(failureCount, error),
		staleTime: 1000 * 60 * 60 * 24 * 7,
		enabled: id > 0,
	});
	return {
		poem: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

function shouldRetryPoemQuery(failureCount: number, error: unknown) {
	const appError = error as AppErrorType | undefined;
	const status = appError?.statusCode;

	if (status === undefined) return failureCount < 3;
	if (status >= 500) return failureCount < 3;

	return false;
}
