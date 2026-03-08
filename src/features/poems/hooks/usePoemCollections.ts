import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

type PoemCollectionType = {
	id: number;
	poemIds: number[];
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
};

type CreateCollectionInput = {
	userId: number;
	name: string;
	description: string;
};

type UpdateCollectionItemInput = {
	collectionId: number;
	poemId: number;
};

export function usePoemCollections(enabled = true) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['poem-collections'],
		enabled,
		queryFn: () => createHTTPRequest<PoemCollectionType[]>({ path: '/poems/collections' }),
	});

	const createCollectionMutation = useMutation({
		mutationFn: (data: CreateCollectionInput) =>
			createHTTPRequest<void, CreateCollectionInput>({
				path: '/poems/collections',
				method: 'POST',
				body: data,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['poem-collections'] }),
	});

	const deleteCollectionMutation = useMutation({
		mutationFn: (collectionId: number) =>
			createHTTPRequest<void>({
				path: '/poems/collections',
				method: 'DELETE',
				params: [collectionId],
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['poem-collections'] }),
	});

	const addCollectionItemMutation = useMutation({
		mutationFn: (data: UpdateCollectionItemInput) =>
			createHTTPRequest<void, { poemId: number }>({
				path: '/poems/collections',
				params: [data.collectionId, 'items'],
				method: 'POST',
				body: { poemId: data.poemId },
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['poem-collections'] }),
	});

	const removeCollectionItemMutation = useMutation({
		mutationFn: (data: UpdateCollectionItemInput) =>
			createHTTPRequest<void, { poemId: number }>({
				path: '/poems/collections',
				params: [data.collectionId, 'items'],
				method: 'DELETE',
				body: { poemId: data.poemId },
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['poem-collections'] }),
	});

	function getErrorMessage() {
		const error = (query.error ||
			createCollectionMutation.error ||
			deleteCollectionMutation.error ||
			addCollectionItemMutation.error ||
			removeCollectionItemMutation.error) as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 401) return 'Faça login para gerenciar coleções.';
		if (error.statusCode === 403) return 'Você não tem permissão para alterar esta coleção.';
		if (error.statusCode === 404) return 'Coleção ou poema não encontrado.';
		if (error.statusCode === 409)
			return 'Já existe uma coleção com esse nome ou o poema já foi adicionado.';
		return 'Erro ao gerenciar coleções.';
	}

	return {
		collections: query.data ?? [],
		isLoadingCollections: query.isLoading,
		isCollectionsError: query.isError,
		createCollection: createCollectionMutation.mutateAsync,
		deleteCollection: deleteCollectionMutation.mutateAsync,
		addPoemToCollection: addCollectionItemMutation.mutateAsync,
		removePoemFromCollection: removeCollectionItemMutation.mutateAsync,
		isUpdatingCollections:
			createCollectionMutation.isPending ||
			deleteCollectionMutation.isPending ||
			addCollectionItemMutation.isPending ||
			removeCollectionItemMutation.isPending,
		collectionsError: getErrorMessage(),
	};
}
