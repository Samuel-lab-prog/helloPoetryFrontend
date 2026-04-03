import { moderation } from '@features/moderation/api/endpoints';
import { moderationKeys } from '@features/moderation/api/keys';
import type { ModeratePoemBody } from '@features/moderation/api/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export function usePoemModerationData(enabled: boolean) {
	const pendingQuery = useQuery({
		queryKey: moderationKeys.pendingPoems(),
		enabled,
		staleTime: 1000 * 30,
		queryFn: () => moderation.getPendingPoems.query().queryFn(),
	});

	const moderateMutation = useMutation({
		mutationFn: (payload: ModeratePoemBody) => moderation.moderatePoem.mutate(payload),
	});

	const pendingPoems = useMemo(() => pendingQuery.data ?? [], [pendingQuery.data]);

	const handleModeration = useCallback(
		(poemId: number, status: ModeratePoemBody['moderationStatus']) => {
			if (moderateMutation.isPending) return;
			void moderateMutation.mutateAsync({
				poemId: String(poemId),
				moderationStatus: status,
			});
		},
		[moderateMutation],
	);

	return {
		pendingQuery,
		pendingPoems,
		isModerating: moderateMutation.isPending,
		handleModeration,
	};
}
