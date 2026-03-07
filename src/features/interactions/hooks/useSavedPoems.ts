import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

type SavedPoemType = {
	id: number;
	title: string;
	slug: string;
	savedAt: string;
};

export function useSavedPoems(enabled = true) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['saved-poems'],
		enabled,
		queryFn: () => createHTTPRequest<SavedPoemType[]>({ path: '/poems/saved' }),
	});

	const saveMutation = useMutation({
		mutationFn: (poemId: number) =>
			createHTTPRequest<void>({
				path: '/poems',
				params: [poemId, 'save'],
				method: 'POST',
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['saved-poems'] }),
	});

	const unsaveMutation = useMutation({
		mutationFn: (poemId: number) =>
			createHTTPRequest<void>({
				path: '/poems',
				params: [poemId, 'save'],
				method: 'DELETE',
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['saved-poems'] }),
	});

	function getErrorMessage() {
		const error = (saveMutation.error ||
			unsaveMutation.error) as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 401) return 'Faca login para salvar poemas.';
		if (error.statusCode === 404) return 'Poema não encontrado.';
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
