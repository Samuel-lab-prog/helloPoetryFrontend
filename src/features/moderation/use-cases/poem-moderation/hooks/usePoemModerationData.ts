import { moderation } from '@Api/moderation/endpoints';
import { moderationKeys } from '@Api/moderation/keys';
import type { ModeratePoemBody } from '@Api/moderation/types';
import { poems } from '@Api/poems/endpoints';
import { toaster } from '@BaseComponents';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EXIT_ANIMATION_MS = 220;

export function usePoemModerationData(enabled: boolean) {
	const [removingPoemIds, setRemovingPoemIds] = useState<Set<number>>(new Set());
	const [hiddenPoemIds, setHiddenPoemIds] = useState<Set<number>>(new Set());
	const removalTimersRef = useRef(new Map<number, number>());

	const pendingQuery = useQuery({
		queryKey: moderationKeys.pendingPoems(),
		enabled,
		staleTime: 1000 * 30,
		queryFn: () => moderation.getPendingPoems.query().queryFn(),
	});

	const moderateMutation = useMutation({
		mutationFn: (payload: ModeratePoemBody) => moderation.moderatePoem.mutate(payload),
	});

	const pendingPoems = useMemo(
		() => (pendingQuery.data ?? []).filter((poem) => !hiddenPoemIds.has(poem.id)),
		[pendingQuery.data, hiddenPoemIds],
	);

	const clearRemovalTimer = useCallback((poemId: number) => {
		const timer = removalTimersRef.current.get(poemId);
		if (timer) {
			window.clearTimeout(timer);
			removalTimersRef.current.delete(poemId);
		}
	}, []);

	const restorePoem = useCallback(
		(poemId: number) => {
			clearRemovalTimer(poemId);
			setRemovingPoemIds((prev) => {
				const next = new Set(prev);
				next.delete(poemId);
				return next;
			});
			setHiddenPoemIds((prev) => {
				const next = new Set(prev);
				next.delete(poemId);
				return next;
			});
		},
		[clearRemovalTimer],
	);

	const scheduleHidePoem = useCallback(
		(poemId: number) => {
			clearRemovalTimer(poemId);
			const timer = window.setTimeout(() => {
				setHiddenPoemIds((prev) => new Set(prev).add(poemId));
				setRemovingPoemIds((prev) => {
					const next = new Set(prev);
					next.delete(poemId);
					return next;
				});
				removalTimersRef.current.delete(poemId);
			}, EXIT_ANIMATION_MS);
			removalTimersRef.current.set(poemId, timer);
		},
		[clearRemovalTimer],
	);

	useEffect(
		() => () => {
			removalTimersRef.current.forEach((timer) => window.clearTimeout(timer));
			removalTimersRef.current.clear();
		},
		[],
	);

	const handleModeration = useCallback(
		async (poemId: number, status: ModeratePoemBody['moderationStatus'], reason?: string) => {
			if (moderateMutation.isPending || removingPoemIds.has(poemId)) return;
			setRemovingPoemIds((prev) => new Set(prev).add(poemId));

			try {
				await moderateMutation.mutateAsync({
					poemId: String(poemId),
					moderationStatus: status,
					reason,
				});
				void poems.getPoem.invalidate(String(poemId));
				scheduleHidePoem(poemId);
			} catch (error) {
				restorePoem(poemId);
				toaster.create({
					type: 'error',
					title: status === 'approved' ? 'Could not approve poem' : 'Could not reject poem',
					description: error instanceof Error ? error.message : 'Try again later.',
					closable: true,
				});
			}
		},
		[moderateMutation, removingPoemIds, restorePoem, scheduleHidePoem],
	);

	return {
		pendingQuery,
		pendingPoems,
		isModerating: moderateMutation.isPending || removingPoemIds.size > 0,
		isModeratingPoem: (poemId: number) =>
			removingPoemIds.has(poemId) ||
			(moderateMutation.isPending && moderateMutation.variables?.poemId === String(poemId)),
		isRemovingPoem: (poemId: number) => removingPoemIds.has(poemId),
		handleModeration,
	};
}
