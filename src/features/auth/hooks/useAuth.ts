import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

export function useAuth() {
	return useQuery({
		queryKey: ['auth'],
		queryFn: async () => {
			try {
				await createHTTPRequest<{ id: number }>({
					path: '/auth',
					method: 'POST',
				});
				return true;
			} catch (err) {
				const error = err as AppErrorType;
				if (error.statusCode !== 204) {
					return false;
				}
				throw err;
			}
		},
		staleTime: 1000 * 60 * 60 * 24 * 1,
		retry: false,
	});
}
