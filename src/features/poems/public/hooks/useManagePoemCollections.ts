import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { CollectionItemBody, CreateCollectionBody, PoemCollection } from '@Api/poems/types';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';

export function usePoemCollections(enabled = true) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const [deletingCollectionIds, setDeletingCollectionIds] = useState<Set<number>>(new Set());
	const [addingItemKeys, setAddingItemKeys] = useState<Set<string>>(new Set());
	const [removingItemKeys, setRemovingItemKeys] = useState<Set<string>>(new Set());

	const buildItemKey = (collectionId: number, poemId: number) => `${collectionId}:${poemId}`;

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
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: poemKeys.collections() });
			const previousCollections =
				queryClient.getQueryData<PoemCollection[]>(poemKeys.collections()) ?? [];
			const now = new Date().toISOString();
			const optimistic: PoemCollection = {
				id: -Date.now(),
				name: data.name.trim(),
				description: data.description?.trim() || null,
				poemIds: [],
				createdAt: now,
				updatedAt: now,
			};
			queryClient.setQueryData<PoemCollection[]>(poemKeys.collections(), [
				optimistic,
				...previousCollections,
			]);
			return { previousCollections };
		},
		onError: (_error, _data, context) => {
			if (context?.previousCollections) {
				queryClient.setQueryData<PoemCollection[]>(
					poemKeys.collections(),
					context.previousCollections,
				);
			}
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
	});

	const deleteCollectionMutation = useMutation({
		mutationFn: (collectionId: number) => poems.deleteCollection.mutate(String(collectionId)),
		onMutate: (collectionId) => {
			const previousCollections =
				queryClient.getQueryData<PoemCollection[]>(poemKeys.collections()) ?? [];
			setDeletingCollectionIds((prev) => new Set(prev).add(collectionId));
			queryClient.setQueryData<PoemCollection[]>(poemKeys.collections(), (current = []) =>
				current.filter((collection) => collection.id !== collectionId),
			);
			return { previousCollections };
		},
		onError: (_error, _collectionId, context) => {
			if (context?.previousCollections) {
				queryClient.setQueryData<PoemCollection[]>(
					poemKeys.collections(),
					context.previousCollections,
				);
			}
		},
		onSettled: (_data, _error, collectionId) => {
			setDeletingCollectionIds((prev) => {
				const next = new Set(prev);
				next.delete(collectionId);
				return next;
			});
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
	});

	const addCollectionItemMutation = useMutation({
		mutationFn: (data: CollectionItemBody) =>
			poems.addItemToCollection.mutate({
				collectionId: data.collectionId,
				poemId: data.poemId,
			}),
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: poemKeys.collections() });
			const previousCollections =
				queryClient.getQueryData<PoemCollection[]>(poemKeys.collections()) ?? [];
			const itemKey = buildItemKey(data.collectionId, data.poemId);
			setAddingItemKeys((prev) => new Set(prev).add(itemKey));
			queryClient.setQueryData<PoemCollection[]>(poemKeys.collections(), (current = []) =>
				current.map((collection) => {
					if (collection.id !== data.collectionId) return collection;
					if (collection.poemIds.includes(data.poemId)) return collection;
					return {
						...collection,
						poemIds: [...collection.poemIds, data.poemId],
						updatedAt: new Date().toISOString(),
					};
				}),
			);
			return { previousCollections, itemKey };
		},
		onError: (_error, _data, context) => {
			if (context?.previousCollections) {
				queryClient.setQueryData<PoemCollection[]>(
					poemKeys.collections(),
					context.previousCollections,
				);
			}
		},
		onSettled: (_data, _error, data, context) => {
			setAddingItemKeys((prev) => {
				const next = new Set(prev);
				if (context?.itemKey) {
					next.delete(context.itemKey);
				} else if (data) {
					next.delete(buildItemKey(data.collectionId, data.poemId));
				}
				return next;
			});
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: poemKeys.collections() }),
	});

	const removeCollectionItemMutation = useMutation({
		mutationFn: (data: CollectionItemBody) =>
			poems.removeItemFromCollection.mutate({
				collectionId: data.collectionId,
				poemId: data.poemId,
			}),
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: poemKeys.collections() });
			const previousCollections =
				queryClient.getQueryData<PoemCollection[]>(poemKeys.collections()) ?? [];
			const itemKey = buildItemKey(data.collectionId, data.poemId);
			setRemovingItemKeys((prev) => new Set(prev).add(itemKey));
			queryClient.setQueryData<PoemCollection[]>(poemKeys.collections(), (current = []) =>
				current.map((collection) => {
					if (collection.id !== data.collectionId) return collection;
					if (!collection.poemIds.includes(data.poemId)) return collection;
					return {
						...collection,
						poemIds: collection.poemIds.filter((id) => id !== data.poemId),
						updatedAt: new Date().toISOString(),
					};
				}),
			);
			return { previousCollections, itemKey };
		},
		onError: (_error, _data, context) => {
			if (context?.previousCollections) {
				queryClient.setQueryData<PoemCollection[]>(
					poemKeys.collections(),
					context.previousCollections,
				);
			}
		},
		onSettled: (_data, _error, data, context) => {
			setRemovingItemKeys((prev) => {
				const next = new Set(prev);
				if (context?.itemKey) {
					next.delete(context.itemKey);
				} else if (data) {
					next.delete(buildItemKey(data.collectionId, data.poemId));
				}
				return next;
			});
		},
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
		if (error.statusCode === 409)
			return 'A collection with this name already exists or the poem was already added.';
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
		isCreatingCollection: createCollectionMutation.isPending,
		isDeletingCollection: (collectionId: number) => deletingCollectionIds.has(collectionId),
		isAddingCollectionItem: (collectionId: number, poemId: number) =>
			addingItemKeys.has(buildItemKey(collectionId, poemId)),
		isRemovingCollectionItem: (collectionId: number, poemId: number) =>
			removingItemKeys.has(buildItemKey(collectionId, poemId)),
		collectionsError: getErrorMessage(),
	};
}
