import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import { useAuthClientStore } from '@features/auth';

export type MyFriendRequestsType = {
	sent: {
		addresseeId: number;
		addresseeNickname: string;
		addresseeAvatarUrl: string | null;
	}[];
	received: {
		requesterId: number;
		requesterNickname: string;
		requesterAvatarUrl: string | null;
	}[];
};

export function useMyFriendRequests(enabled = true) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: ['my-friend-requests', clientId],
		enabled: enabled && !!clientId,
		staleTime: Infinity,
		queryFn: () =>
			createHTTPRequest<MyFriendRequestsType>({
				path: '/friends/requests',
			}),
	});

	return {
		requests: query.data ?? { sent: [], received: [] },
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
