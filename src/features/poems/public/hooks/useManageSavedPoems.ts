import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';

export type SavedPoemType = {
	id: number;
	title: string;
	slug: string;
	savedAt: string;
};

export function useSavedPoems(enabled = true) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		...api.poems.getSavedPoems.query(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
	});

	const saveMutation = useMutation({
		mutationFn: (poemId: number) => api.poems.savePoem.mutate(String(poemId)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.saved() }),
	});

	const unsaveMutation = useMutation({
		mutationFn: (poemId: number) => api.poems.removeSavedPoem.mutate(String(poemId)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.saved() }),
	});

	function getErrorMessage() {
		const error = (saveMutation.error || unsaveMutation.error) as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 401) return 'Sign in to save poems.';
		if (error.statusCode === 404) return 'Poem not found.';
		if (error.statusCode === 409) return 'Poem is already saved.';
		return 'Error updating saved poem.';
	}

	return {
		savedPoems: query.data ?? [],
		isLoadingSavedPoems: query.isLoading,
		savePoem: saveMutation.mutateAsync,
		unsavePoem: unsaveMutation.mutateAsync,
		isSavingPoem: saveMutation.isPending || unsaveMutation.isPending,
		saveError: getErrorMessage(),
	};
}
