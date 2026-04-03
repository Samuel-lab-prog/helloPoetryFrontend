import { type AppErrorType } from '@BaseComponents';
import { friends } from '@root/features/friends/api/endpoints';
import type { AuthorProfileType } from '@root/features/poems/types';
import { userKeys } from '@root/features/users/api/keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type FriendRequestResult = {
	id: number;
	requesterId: number;
	addresseeId: number;
	createdAt: string;
};

export function useSendFriendRequest() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (authorId: number) =>
			friends.sendFriendRequest.mutate(String(authorId)) as Promise<FriendRequestResult>,
		onMutate: async (authorId) => {
			const queryKey = userKeys.profile(String(authorId));
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
			queryClient.invalidateQueries({ queryKey: userKeys.profile(String(authorId)) });
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
