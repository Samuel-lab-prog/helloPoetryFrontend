import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@BaseComponents';
import { api, apiKeys } from '@root/core/api';
import type { AuthorProfileType } from '@root/features/poems/types';

export function useCancelFriendRequest() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (authorId: number) => api.friends.cancelFriendRequest.mutate(String(authorId)),
		onMutate: async (authorId) => {
			const queryKey = apiKeys.users.profile(String(authorId));
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
			queryClient.invalidateQueries({ queryKey: apiKeys.users.profile(String(authorId)) });
			queryClient.invalidateQueries({ queryKey: apiKeys.friends.requests() });
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
