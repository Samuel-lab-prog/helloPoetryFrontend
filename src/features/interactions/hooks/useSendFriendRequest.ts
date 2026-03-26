import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@root/core/base';
import { api, apiKeys } from '@root/core/api';

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
			api.friends.sendFriendRequest.mutate(String(authorId)) as Promise<FriendRequestResult>,
		onSuccess: (_, authorId) => {
			queryClient.invalidateQueries({ queryKey: apiKeys.users.profile(String(authorId)) });
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
		isSuccess: mutation.isSuccess,
		errorMessage: getErrorMessage(),
		reset: mutation.reset,
	};
}
