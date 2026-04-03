import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { friends } from '@features/friends/api/endpoints';
import { friendsKeys } from '@features/friends/api/keys';
import type { AuthorProfileType } from '@features/poems/public/types';
import { userKeys } from '@features/users/api/keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function useFriendRequestActions() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const profileKey = clientId
		? userKeys.profile(String(clientId))
		: (['users', 'profile'] as const);

	const acceptMutation = useMutation({
		mutationFn: (requesterId: number) => friends.acceptFriendRequest.mutate(String(requesterId)),
		onMutate: async (requesterId) => {
			const queryKey = userKeys.profile(String(requesterId));
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);

			if (previousProfile) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					hasIncomingFriendRequest: false,
					isFriend: true,
				});
			}

			return { previousProfile, queryKey };
		},
		onError: (_error, _requesterId, context) => {
			if (context?.previousProfile) {
				queryClient.setQueryData(context.queryKey, context.previousProfile);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
			queryClient.invalidateQueries({ queryKey: friendsKeys.requests() });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (requesterId: number) => friends.rejectFriendRequest.mutate(String(requesterId)),
		onMutate: async (requesterId) => {
			const queryKey = userKeys.profile(String(requesterId));
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);

			if (previousProfile) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					hasIncomingFriendRequest: false,
				});
			}

			return { previousProfile, queryKey };
		},
		onError: (_error, _requesterId, context) => {
			if (context?.previousProfile) {
				queryClient.setQueryData(context.queryKey, context.previousProfile);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
			queryClient.invalidateQueries({ queryKey: friendsKeys.requests() });
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
