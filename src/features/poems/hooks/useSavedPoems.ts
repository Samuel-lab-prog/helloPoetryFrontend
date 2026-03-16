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
		queryKey: apiKeys.poems.saved(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
		queryFn: () => api.poems.getSavedPoems.query().queryFn(),
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
		if (error.statusCode === 401) return 'Faca login para salvar poemas.';
		if (error.statusCode === 404) return 'Poema n�o encontrado.';
		if (error.statusCode === 409) return 'Poema ja esta salvo.';
		return 'Erro ao atualizar poema salvo.';
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
