import { useQuery } from '@tanstack/react-query';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';

export type MyFriendRequestsType = {
	sent: {
		addresseeId: number;
		addresseeName: string;
		addresseeNickname: string;
		addresseeAvatarUrl: string | null;
	}[];
	received: {
		requesterId: number;
		requesterName: string;
		requesterNickname: string;
		requesterAvatarUrl: string | null;
	}[];
};

export function useMyFriendRequests(enabled = true) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: apiKeys.friends.requests(),
		enabled: enabled && !!clientId,
		staleTime: Infinity,
		queryFn: () => api.friends.getMyFriendRequests.query().queryFn(),
	});

	return {
		requests: query.data ?? { sent: [], received: [] },
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
