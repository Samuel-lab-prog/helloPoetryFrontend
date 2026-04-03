import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { friends } from '@root/features/friends/api/endpoints';
import { friendsKeys } from '@root/features/friends/api/keys';
import { useQuery } from '@tanstack/react-query';

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
		queryKey: friendsKeys.requests(),
		enabled: enabled && !!clientId,
		staleTime: Infinity,
		queryFn: () => friends.getMyFriendRequests.query().queryFn(),
	});

	return {
		requests: query.data ?? { sent: [], received: [] },
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
