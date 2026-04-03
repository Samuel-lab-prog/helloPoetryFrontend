import type { FullPoem, SavedPoem } from '@features/poems/api/types';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { poems } from '@root/features/poems/api/endpoints';
import { poemKeys } from '@root/features/poems/api/keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';

export type SavedPoemType = {
	id: number;
	title: string;
	slug: string;
	savedAt: string;
};

export function useSavedPoems(enabled = true) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
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
			await queryClient.cancelQueries({ queryKey: savedKey });
			const previous = queryClient.getQueryData<SavedPoem[]>(savedKey) ?? [];
			if (previous.some((poem) => poem.id === poemId)) return { previous };
			const poem = queryClient.getQueryData<FullPoem>(poemKeys.byId(String(poemId)));
			const optimistic: SavedPoem = {
				id: poemId,
				title: poem?.title ?? 'Poem',
				slug: poem?.slug ?? '',
				savedAt: new Date().toISOString(),
			};
			queryClient.setQueryData<SavedPoem[]>(savedKey, [...previous, optimistic]);
			return { previous };
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			if (context?.previous) {
				queryClient.setQueryData(savedKey, context.previous);
			}
		},
		onSettled: (_data, _error, poemId) => {
			setUpdatingSavedPoemId((current) => (current === poemId ? null : current));
			return queryClient.invalidateQueries({ queryKey: savedKey });
		},
	});

	const unsaveMutation = useMutation({
		mutationFn: (poemId: number) => poems.removeSavedPoem.mutate(String(poemId)),
		onMutate: async (poemId) => {
			setUpdatingSavedPoemId(poemId);
			await queryClient.cancelQueries({ queryKey: savedKey });
			const previous = queryClient.getQueryData<SavedPoem[]>(savedKey) ?? [];
			queryClient.setQueryData<SavedPoem[]>(
				savedKey,
				previous.filter((poem) => poem.id !== poemId),
			);
			return { previous };
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			if (context?.previous) {
				queryClient.setQueryData(savedKey, context.previous);
			}
		},
		onSettled: (_data, _error, poemId) => {
			setUpdatingSavedPoemId((current) => (current === poemId ? null : current));
			return queryClient.invalidateQueries({ queryKey: savedKey });
		},
	});

	function getErrorMessage() {
		const error = (saveMutation.error || unsaveMutation.error) as unknown as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 401) return 'Sign in to save poems.';
		if (error.statusCode === 404) return 'Poem not found.';
		if (error.statusCode === 409) return '';
		return 'Error updating saved poem.';
	}

	return {
		savedPoems: query.data ?? [],
		isLoadingSavedPoems: query.isLoading,
		savePoem: saveMutation.mutateAsync,
		unsavePoem: unsaveMutation.mutateAsync,
		updatingSavedPoemId,
		isSavingPoem: updatingSavedPoemId !== null,
		saveError: getErrorMessage(),
	};
}
