import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { CollectionItemBody, CreateCollectionBody } from '@Api/poems/types';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

export function usePoemCollections(enabled = true) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		...poems.getCollections.query(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
	});

	const createCollectionMutation = useMutation({
		mutationFn: (data: CreateCollectionBody) =>
			poems.createCollection.mutate({
				userId: data.userId,
				name: data.name,
				description: data.description?.trim() || undefined,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
	});

	const deleteCollectionMutation = useMutation({
		mutationFn: (collectionId: number) => poems.deleteCollection.mutate(String(collectionId)),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
	});

	const addCollectionItemMutation = useMutation({
		mutationFn: (data: CollectionItemBody) =>
			poems.addItemToCollection.mutate({
				collectionId: data.collectionId,
				poemId: data.poemId,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
	});

	const removeCollectionItemMutation = useMutation({
		mutationFn: (data: CollectionItemBody) =>
			poems.removeItemFromCollection.mutate({
				collectionId: data.collectionId,
				poemId: data.poemId,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
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
