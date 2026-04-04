import { getFriendsRequestsPort, type MyFriendRequestsType } from '@core/ports/friends';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useQuery } from '@tanstack/react-query';

export function useMyFriendRequests(enabled = true) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const friendsRequestsPort = getFriendsRequestsPort();

	const query = useQuery({
		...friendsRequestsPort.getMyFriendRequestsQueryOptions(),
		enabled: enabled && !!clientId,
		staleTime: Infinity,
	});

	return {
		requests: (query.data ?? { sent: [], received: [] }) as MyFriendRequestsType,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

export type { MyFriendRequestsType };
