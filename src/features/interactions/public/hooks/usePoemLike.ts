import { interactions } from '@Api/interactions/endpoints';
import { restoreSnapshot, snapshotQueryData } from '@Api/optimistic';
import { getPoemsCachePort } from '@core/ports/poems';
import { getAccessDeniedMessage } from '@features/auth/public';
import type { FullPoem } from '@features/poems/public/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function usePoemLike(poemId: number) {
	const queryClient = useQueryClient();
	const poemsCachePort = getPoemsCachePort();
	const poemKey = poemsCachePort.getPoemKey(poemId);

	function optimisticUpdate(nextLiked: boolean) {
		queryClient.setQueryData<FullPoem | undefined>(poemKey, (current) => {
			if (!current) return current;
			const baseStats = current.stats ?? {
				likesCount: 0,
				commentsCount: 0,
				likedByCurrentUser: false,
			};
			const likesCount = baseStats.likesCount ?? 0;
			return {
				...current,
				stats: {
					...baseStats,
					likedByCurrentUser: nextLiked,
					likesCount: Math.max(0, likesCount + (nextLiked ? 1 : -1)),
				},
			};
		});
	}

	const likeMutation = useMutation({
		mutationFn: () => interactions.likePoem.mutate(String(poemId)),
		onMutate: async () => {
			const previousPoem = await snapshotQueryData<FullPoem>(queryClient, poemKey);
			optimisticUpdate(true);
			return previousPoem;
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			restoreSnapshot(queryClient, context);
		},
	});

	const unlikeMutation = useMutation({
		mutationFn: () => interactions.unlikePoem.mutate(String(poemId)),
		onMutate: async () => {
			const previousPoem = await snapshotQueryData<FullPoem>(queryClient, poemKey);
			optimisticUpdate(false);
			return previousPoem;
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			restoreSnapshot(queryClient, context);
		},
	});

	function getErrorMessage() {
		const error = (likeMutation.error || unlikeMutation.error) as unknown as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 404) return 'Poem not found.';
		if (error.statusCode === 409) return '';
		if (error.statusCode === 403) {
			return getAccessDeniedMessage({
				fallback: 'You cannot like this poem.',
				suspendedMessage: 'Your account is suspended, so you cannot like this poem.',
			});
		}
		return 'Error updating like.';
	}

	return {
		likePoem: likeMutation.mutateAsync,
		unlikePoem: unlikeMutation.mutateAsync,
		isUpdatingLike: likeMutation.isPending || unlikeMutation.isPending,
		likeError: getErrorMessage(),
	};
}
