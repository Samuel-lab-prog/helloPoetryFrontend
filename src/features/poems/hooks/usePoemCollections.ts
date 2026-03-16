import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';

export type PoemCollectionType = {
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
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: apiKeys.poems.collections(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
		queryFn: () => api.poems.getCollections.query().queryFn(),
	});

	const createCollectionMutation = useMutation({
		mutationFn: (data: CreateCollectionInput) =>
			api.poems.createCollection.mutate({
				userId: String(data.userId),
				name: data.name,
				description: data.description,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
	});

	const deleteCollectionMutation = useMutation({
		mutationFn: (collectionId: number) => api.poems.deleteCollection.mutate(String(collectionId)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
	});

	const addCollectionItemMutation = useMutation({
		mutationFn: (data: UpdateCollectionItemInput) =>
			api.poems.addItemToCollection.mutate({
				collectionId: String(data.collectionId),
				poemId: String(data.poemId),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
	});

	const removeCollectionItemMutation = useMutation({
		mutationFn: (data: UpdateCollectionItemInput) =>
			api.poems.removeItemFromCollection.mutate({
				collectionId: String(data.collectionId),
				poemId: String(data.poemId),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
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
		if (error.statusCode === 409) {
			return 'Já existe uma coleção com esse nome ou o poema já foi adicionado.';
		}
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
