import { getFriendsActionsPort, type MyFriendRequestsType } from '@core/ports/friends';
import { getUsersCachePort } from '@core/ports/users';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import type { AuthorProfileType } from '@features/poems/public/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function useFriendRequestActions() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const friendsActionsPort = getFriendsActionsPort();
	const usersCachePort = getUsersCachePort();
	const profileKey = clientId
		? usersCachePort.getProfileKey(clientId)
		: (['users', 'profile'] as const);

	const acceptMutation = useMutation({
		mutationFn: (requesterId: number) => friendsActionsPort.acceptFriendRequest(requesterId),
		onMutate: async (requesterId) => {
			const queryKey = usersCachePort.getProfileKey(requesterId);
			const requestsKey = friendsActionsPort.getRequestsKey();
			await queryClient.cancelQueries({ queryKey: requestsKey });
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);
			const previousRequests = queryClient.getQueryData<MyFriendRequestsType>(requestsKey) ?? null;

			if (previousProfile) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					hasIncomingFriendRequest: false,
					isFriend: true,
				});
			}
			if (previousRequests) {
				queryClient.setQueryData<MyFriendRequestsType>(requestsKey, {
					...previousRequests,
					received: previousRequests.received.filter(
						(request) => request.requesterId !== requesterId,
					),
				});
			}

			return { previousProfile, queryKey, previousRequests, requestsKey };
		},
		onError: (_error, _requesterId, context) => {
			if (context?.previousProfile) {
				queryClient.setQueryData(context.queryKey, context.previousProfile);
			}
			if (context?.previousRequests) {
				queryClient.setQueryData(context.requestsKey, context.previousRequests);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
			queryClient.invalidateQueries({ queryKey: friendsActionsPort.getRequestsKey() });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (requesterId: number) => friendsActionsPort.rejectFriendRequest(requesterId),
		onMutate: async (requesterId) => {
			const queryKey = usersCachePort.getProfileKey(requesterId);
			const requestsKey = friendsActionsPort.getRequestsKey();
			await queryClient.cancelQueries({ queryKey: requestsKey });
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);
			const previousRequests = queryClient.getQueryData<MyFriendRequestsType>(requestsKey) ?? null;

			if (previousProfile) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					hasIncomingFriendRequest: false,
				});
			}
			if (previousRequests) {
				queryClient.setQueryData<MyFriendRequestsType>(requestsKey, {
					...previousRequests,
					received: previousRequests.received.filter(
						(request) => request.requesterId !== requesterId,
					),
				});
			}

			return { previousProfile, queryKey, previousRequests, requestsKey };
		},
		onError: (_error, _requesterId, context) => {
			if (context?.previousProfile) {
				queryClient.setQueryData(context.queryKey, context.previousProfile);
			}
			if (context?.previousRequests) {
				queryClient.setQueryData(context.requestsKey, context.previousRequests);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
			queryClient.invalidateQueries({ queryKey: friendsActionsPort.getRequestsKey() });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	function getErrorMessage() {
		const err = (acceptMutation.error || rejectMutation.error) as unknown as
			| AppErrorType
			| undefined;
		if (!err) return '';
		if (err.statusCode === 404) return 'Request not found.';
		if (err.statusCode === 403) return 'You cannot perform this action.';
		return 'Error processing request.';
	}

	return {
		acceptRequest: acceptMutation.mutateAsync,
		rejectRequest: rejectMutation.mutateAsync,
		isAccepting: acceptMutation.isPending,
		isRejecting: rejectMutation.isPending,
		errorMessage: getErrorMessage(),
	};
}
