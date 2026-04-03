import { friends } from '@features/friends/api/endpoints';
import type { AuthorProfileType } from '@features/poems/public/types';
import { userKeys } from '@features/users/api/keys';
import { eventBus } from '@root/core/events/eventBus';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function useCancelFriendRequest() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (authorId: number) => friends.cancelFriendRequest.mutate(String(authorId)),
		onMutate: async (authorId) => {
			const queryKey = userKeys.profile(String(authorId));
			await queryClient.cancelQueries({ queryKey });
			const previousProfile = queryClient.getQueryData<AuthorProfileType>(queryKey);

			if (previousProfile)
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile,
					isFriendRequester: false,
				});

			return { previousProfile, queryKey };
		},
		onError: (_error, _authorId, context) => {
			if (context?.previousProfile)
				queryClient.setQueryData(context.queryKey, context.previousProfile);
		},
		onSuccess: (_, authorId) => {
			void eventBus.publish('friendRequestCanceled', {
				authorId,
				occurredAt: new Date().toISOString(),
			});
		},
		onSettled: (_data, _error, _authorId, context) => {
			if (!context?.queryKey) return;
			const authorId = Number(context.queryKey.at(-1));
			if (!Number.isFinite(authorId)) return;
			void eventBus.publish('friendRequestCancelSettled', {
				authorId,
				occurredAt: new Date().toISOString(),
			});
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
