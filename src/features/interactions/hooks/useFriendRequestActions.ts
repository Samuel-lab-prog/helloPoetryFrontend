import { type AppErrorType } from '@BaseComponents';
import { api, apiKeys } from '@root/core/api';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import type { AuthorProfileType } from '@root/features/poems/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useFriendRequestActions() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const profileKey = clientId
		? apiKeys.users.profile(String(clientId))
		: (['users', 'profile'] as const);

	const acceptMutation = useMutation({
		mutationFn: (requesterId: number) =>
			api.friends.acceptFriendRequest.mutate(String(requesterId)),
		onMutate: async (requesterId) => {
			const queryKey = apiKeys.users.profile(String(requesterId));
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
			queryClient.invalidateQueries({ queryKey: apiKeys.friends.requests() });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (requesterId: number) =>
			api.friends.rejectFriendRequest.mutate(String(requesterId)),
		onMutate: async (requesterId) => {
			const queryKey = apiKeys.users.profile(String(requesterId));
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
			queryClient.invalidateQueries({ queryKey: apiKeys.friends.requests() });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	function getErrorMessage() {
		const err = (acceptMutation.error || rejectMutation.error) as AppErrorType | undefined;
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
