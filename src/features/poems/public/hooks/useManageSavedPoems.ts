import { restoreSnapshot, snapshotQueryData } from '@Api/optimistic';
import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { FullPoem, SavedPoem } from '@Api/poems/types';
import {
	getAccessDeniedMessage,
	getBannedPrivilegeMessage,
	isBannedAccessError,
	useAuthClientStore,
} from '@features/auth/public';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';

export function useSavedPoems(enabled = true) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const clientStatus = useAuthClientStore((state) => state.authClient?.status);
	const savedKey = poemKeys.saved();
	const [updatingSavedPoemId, setUpdatingSavedPoemId] = useState<number | null>(null);

	const query = useQuery({
		...poems.getSavedPoems.query(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
	});

	const saveMutation = useMutation({
		mutationFn: (poemId: number) => poems.savePoem.mutate(String(poemId)),
		onMutate: async (poemId) => {
			setUpdatingSavedPoemId(poemId);
			const previous = await snapshotQueryData<SavedPoem[]>(queryClient, savedKey);
			if ((previous.data ?? []).some((poem) => poem.id === poemId)) return previous;
			const poem = queryClient.getQueryData<FullPoem>(poemKeys.byId(String(poemId)));
			const optimistic: SavedPoem = {
				id: poemId,
				title: poem?.title ?? 'Poem',
				slug: poem?.slug ?? '',
				savedAt: new Date().toISOString(),
				author: poem?.author ?? {
					id: -1,
					name: 'Author',
					nickname: 'author',
					avatarUrl: null,
				},
			};
			queryClient.setQueryData<SavedPoem[]>(savedKey, [...(previous.data ?? []), optimistic]);
			return previous;
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			restoreSnapshot(queryClient, context);
		},
		onSettled: (_data, _error, poemId) => {
			setUpdatingSavedPoemId((current) => (current === poemId ? null : current));
			return Promise.all([
				queryClient.invalidateQueries({ queryKey: savedKey, refetchType: 'all' }),
				queryClient.invalidateQueries({
					queryKey: poemKeys.byId(String(poemId)),
					refetchType: 'all',
				}),
			]);
		},
	});

	const unsaveMutation = useMutation({
		mutationFn: (poemId: number) => poems.removeSavedPoem.mutate(String(poemId)),
		onMutate: async (poemId) => {
			setUpdatingSavedPoemId(poemId);
			const previous = await snapshotQueryData<SavedPoem[]>(queryClient, savedKey);
			queryClient.setQueryData<SavedPoem[]>(
				savedKey,
				(previous.data ?? []).filter((poem) => poem.id !== poemId),
			);
			return previous;
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			restoreSnapshot(queryClient, context);
		},
		onSettled: (_data, _error, poemId) => {
			setUpdatingSavedPoemId((current) => (current === poemId ? null : current));
			return Promise.all([
				queryClient.invalidateQueries({ queryKey: savedKey, refetchType: 'all' }),
				queryClient.invalidateQueries({
					queryKey: poemKeys.byId(String(poemId)),
					refetchType: 'all',
				}),
			]);
		},
	});

	function getErrorMessage() {
		if (clientStatus === 'banned') return getBannedPrivilegeMessage('view saved poems');

		const isQueryError = Boolean(query.error);
		const error = (query.error ||
			saveMutation.error ||
			unsaveMutation.error) as unknown as AppErrorType | null;
		if (!error) return '';
		const action = isQueryError ? 'view saved poems' : 'change saved poems';
		if (error.statusCode === 401) {
			if (isBannedAccessError(error)) return getBannedPrivilegeMessage(action);
			return 'Sign in to save poems.';
		}
		if (error.statusCode === 404) return 'Poem not found.';
		if (error.statusCode === 403) {
			return getAccessDeniedMessage({
				bannedAction: action,
				fallback: isQueryError
					? 'You do not have permission to view saved poems.'
					: 'You do not have permission to change saved poems.',
			});
		}
		if (error.statusCode === 409) return '';
		return 'Error updating saved poem.';
	}

	return {
		savedPoems: clientStatus === 'banned' ? [] : (query.data ?? []),
		isLoadingSavedPoems: query.isLoading,
		savePoem: saveMutation.mutateAsync,
		unsavePoem: unsaveMutation.mutateAsync,
		updatingSavedPoemId,
		isSavingPoem: updatingSavedPoemId !== null,
		saveError: getErrorMessage(),
	};
}
