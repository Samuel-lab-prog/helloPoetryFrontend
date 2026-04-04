import { getFriendsActionsPort } from '@core/ports/friends';
import { getUsersCachePort } from '@core/ports/users';
import type { AuthorProfileType } from '@features/poems/public/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function useSendFriendRequest() {
	const queryClient = useQueryClient();
	const friendsActionsPort = getFriendsActionsPort();
	const usersCachePort = getUsersCachePort();

	const mutation = useMutation({
		mutationFn: (authorId: number) => friendsActionsPort.sendFriendRequest(authorId),
		onMutate: async (authorId) => {
			const queryKey = usersCachePort.getProfileKey(authorId);
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);

			if (previousProfile) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					isFriendRequester: true,
					hasIncomingFriendRequest: false,
				});
			}

			return { previousProfile, queryKey };
		},
		onError: (_error, _authorId, context) => {
			if (context?.previousProfile) {
				queryClient.setQueryData(context.queryKey, context.previousProfile);
			}
		},
		onSuccess: (_, authorId) => {
			queryClient.invalidateQueries({ queryKey: usersCachePort.getProfileKey(authorId) });
		},
		onSettled: (_data, _error, _authorId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	function getErrorMessage() {
		const err = mutation.error as AppErrorType | null;
		if (!err) return '';

		if (err.statusCode === 409) return 'Request already sent or relationship already exists.';
		if (err.statusCode === 403) return 'You cannot send a request to this user.';
		if (err.statusCode === 404) return 'Author not found.';
		return 'Error sending friend request.';
	}

	return {
		sendFriendRequest: mutation.mutateAsync,
		isSending: mutation.isPending,
		errorMessage: getErrorMessage(),
		reset: mutation.reset,
	};
}
