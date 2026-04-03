import { type AppErrorType } from '@BaseComponents';
import { friends } from '@root/features/friends/api/endpoints';
import { friendsKeys } from '@root/features/friends/api/keys';
import type { AuthorProfileType } from '@root/features/poems/types';
import { userKeys } from '@root/features/users/api/keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCancelFriendRequest() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (authorId: number) => friends.cancelFriendRequest.mutate(String(authorId)),
		onMutate: async (authorId) => {
			const queryKey = userKeys.profile(String(authorId));
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);

			if (previousProfile) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					isFriendRequester: false,
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
			queryClient.invalidateQueries({ queryKey: friendsKeys.requests() });
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
		if (err.statusCode === 404) return 'Request not found.';
		if (err.statusCode === 403) return 'You cannot cancel this request.';
		return 'Error cancelling request.';
	}

	return {
		cancelFriendRequest: mutation.mutateAsync,
		isCancelling: mutation.isPending,
		errorMessage: getErrorMessage(),
	};
}
