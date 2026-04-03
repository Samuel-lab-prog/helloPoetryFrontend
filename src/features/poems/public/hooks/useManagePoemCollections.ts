import { type AppErrorType } from '@BaseComponents';
import { api, apiKeys } from '@root/core/api';
import type { CollectionItemBody, CreateCollectionBody } from '@root/core/api/poems/types';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePoemCollections(enabled = true) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		...api.poems.getCollections.query(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
	});

	const createCollectionMutation = useMutation({
		mutationFn: (data: CreateCollectionBody) =>
			api.poems.createCollection.mutate({
				userId: data.userId,
				name: data.name,
				description: data.description?.trim() || undefined,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
	});

	const deleteCollectionMutation = useMutation({
		mutationFn: (collectionId: number) => api.poems.deleteCollection.mutate(String(collectionId)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
	});

	const addCollectionItemMutation = useMutation({
		mutationFn: (data: CollectionItemBody) =>
			api.poems.addItemToCollection.mutate({
				collectionId: data.collectionId,
				poemId: data.poemId,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeys.poems.collections() }),
	});

	const removeCollectionItemMutation = useMutation({
		mutationFn: (data: CollectionItemBody) =>
			api.poems.removeItemFromCollection.mutate({
				collectionId: data.collectionId,
				poemId: data.poemId,
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
		if (error.statusCode === 401) return 'Sign in to manage collections.';
		if (error.statusCode === 403) return 'You do not have permission to change this collection.';
		if (error.statusCode === 404) return 'Collection or poem not found.';
		if (error.statusCode === 409) {
			return 'A collection with this name already exists or the poem was already added.';
		}
		return 'Error managing collections.';
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
