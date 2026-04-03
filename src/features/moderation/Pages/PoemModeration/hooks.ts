import { api, apiKeys } from '@root/core/api';
import type { ModeratePoemBody } from '@root/core/api/moderation/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export function usePoemModerationData(enabled: boolean) {
	const pendingQuery = useQuery({
		queryKey: apiKeys.moderation.pendingPoems(),
		enabled,
		staleTime: 1000 * 30,
		queryFn: () => api.moderation.getPendingPoems.query().queryFn(),
	});

	const moderateMutation = useMutation({
		mutationFn: (payload: ModeratePoemBody) => api.moderation.moderatePoem.mutate(payload),
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
