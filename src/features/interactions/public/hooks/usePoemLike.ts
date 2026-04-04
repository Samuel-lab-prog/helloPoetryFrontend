import { getPoemsCachePort } from '@core/ports/poems';
import { interactions } from '@features/interactions/api/endpoints';
import type { FullPoem } from '@features/poems/public/types';
import { eventBus } from '@root/core/events/eventBus';
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
			await queryClient.cancelQueries({ queryKey: poemKey });
			const previousPoem = queryClient.getQueryData<FullPoem>(poemKey);
			optimisticUpdate(true);
			return { previousPoem, nextLiked: true };
		},
		onSuccess: () =>
			eventBus.publish('poemLiked', {
				poemId,
				liked: true,
				likedAt: new Date().toISOString(),
			}),
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			if (context?.previousPoem) {
				queryClient.setQueryData(poemKey, context.previousPoem);
			}
		},
	});

	const unlikeMutation = useMutation({
		mutationFn: () => interactions.unlikePoem.mutate(String(poemId)),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: poemKey });
			const previousPoem = queryClient.getQueryData<FullPoem>(poemKey);
			optimisticUpdate(false);
			return { previousPoem, nextLiked: false };
		},
		onSuccess: () =>
			eventBus.publish('poemLiked', {
				poemId,
				liked: false,
				likedAt: new Date().toISOString(),
			}),
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			if (context?.previousPoem) {
				queryClient.setQueryData(poemKey, context.previousPoem);
			}
		},
	});

	function getErrorMessage() {
		const error = (likeMutation.error || unlikeMutation.error) as unknown as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 404) return 'Poem not found.';
		if (error.statusCode === 409) return '';
		return 'Error updating like.';
	}

	return {
		likePoem: likeMutation.mutateAsync,
		unlikePoem: unlikeMutation.mutateAsync,
		isUpdatingLike: likeMutation.isPending || unlikeMutation.isPending,
		likeError: getErrorMessage(),
	};
}
