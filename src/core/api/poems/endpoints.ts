import { createMutationEndpoint, createQueryEndpoint } from '@Api/utils';
import { createHTTPRequest } from '@Utils';

import { poemKeys } from './keys';
import type {
	CollectionItemBody,
	CreateCollectionBody,
	CreatePoemBody,
	CreatePoemResult,
	FullPoem,
	PaginatedPoems,
	PoemAudioUploadUrlRequest,
	PoemAudioUploadUrlResponse,
	PoemCollection,
	SavedPoem,
	SearchPoemsParams,
	UpdatePoemAudioBody,
	UpdatePoemAudioResponse,
	UpdatePoemBody,
	UpdatePoemResult,
} from './types';

const createPoem = createMutationEndpoint<CreatePoemBody, CreatePoemResult>({
	fn: (data) =>
		createHTTPRequest<CreatePoemResult, CreatePoemBody>({
			method: 'POST',
			path: `/poems`,
			body: data,
		}),

	invalidate: [poemKeys.all, poemKeys.mine],
});

const getPoem = createQueryEndpoint<[string], FullPoem>({
	key: poemKeys.byId,

	fn: (id) =>
		createHTTPRequest<FullPoem>({
			method: 'GET',
			path: `/poems/${id}`,
		}),
});

const getMyPoems = createQueryEndpoint<[], FullPoem[]>({
	key: poemKeys.mine,

	fn: () =>
		createHTTPRequest<FullPoem[]>({
			method: 'GET',
			path: `/poems/me`,
		}),
});

const getAuthorPoems = createQueryEndpoint<[string], FullPoem[]>({
	key: poemKeys.byAuthor,

	fn: (authorId) =>
		createHTTPRequest<FullPoem[]>({
			method: 'GET',
			path: `/poems/authors/${authorId}`,
		}),
});

const getPoems = createQueryEndpoint<[SearchPoemsParams?], PaginatedPoems>({
	key: poemKeys.search,

	fn: (params = {}) =>
		createHTTPRequest<PaginatedPoems>({
			method: 'GET',
			path: `/poems`,
			query: params,
		}),
});

const getSavedPoems = createQueryEndpoint<[], SavedPoem[]>({
	key: poemKeys.saved,

	fn: () =>
		createHTTPRequest<SavedPoem[]>({
			method: 'GET',
			path: `/poems/saved`,
		}),
});

const getCollections = createQueryEndpoint<[], PoemCollection[]>({
	key: poemKeys.collections,

	fn: () =>
		createHTTPRequest<PoemCollection[]>({
			method: 'GET',
			path: `/poems/collections`,
		}),
});

const updatePoem = createMutationEndpoint<UpdatePoemBody, UpdatePoemResult>({
	fn: (data) =>
		createHTTPRequest<UpdatePoemResult, Omit<UpdatePoemBody, 'id'>>({
			method: 'PUT',
			path: `/poems/${data.id}`,
			body: {
				title: data.title,
				excerpt: data.excerpt,
				content: data.content,
				tags: data.tags,
				visibility: data.visibility,
				status: data.status,
				isCommentable: data.isCommentable,
				toUserIds: data.toUserIds,
				mentionedUserIds: data.mentionedUserIds,
			},
		}),

	invalidate: [poemKeys.all, poemKeys.mine],
});

const deletePoem = createMutationEndpoint<string, void>({
	fn: (id) =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/poems/${id}`,
		}),

	invalidate: [poemKeys.all, poemKeys.mine],
});

const requestPoemAudioUploadUrl = createMutationEndpoint<
	PoemAudioUploadUrlRequest,
	PoemAudioUploadUrlResponse
>({
	fn: (data) =>
		createHTTPRequest<PoemAudioUploadUrlResponse, { contentType: string; contentLength?: number }>({
			method: 'POST',
			path: `/poems/${data.poemId}/audio/upload-url`,
			body: {
				contentType: data.contentType,
				contentLength: data.contentLength,
			},
		}),
});

const updatePoemAudio = createMutationEndpoint<UpdatePoemAudioBody, UpdatePoemAudioResponse>({
	fn: (data) =>
		createHTTPRequest<UpdatePoemAudioResponse, { audioUrl: string | null }>({
			method: 'PATCH',
			path: `/poems/${data.poemId}/audio`,
			body: {
				audioUrl: data.audioUrl,
			},
		}),
	invalidate: [poemKeys.all, poemKeys.mine],
});

const savePoem = createMutationEndpoint<string, void>({
	fn: (id) =>
		createHTTPRequest<void>({
			method: 'POST',
			path: `/poems/${id}/save`,
		}),

	invalidate: [poemKeys.saved],
});

const removeSavedPoem = createMutationEndpoint<string, void>({
	fn: (id) =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/poems/${id}/save`,
		}),

	invalidate: [poemKeys.saved],
});

const createCollection = createMutationEndpoint<CreateCollectionBody, void>({
	fn: (data) =>
		createHTTPRequest<void, CreateCollectionBody>({
			method: 'POST',
			path: `/poems/collections`,
			body: data,
		}),

	invalidate: [poemKeys.collections],
});

const addItemToCollection = createMutationEndpoint<CollectionItemBody, void>({
	fn: (data) =>
		createHTTPRequest<void, { poemId: number }>({
			method: 'POST',
			path: `/poems/collections/${data.collectionId}/items`,
			body: {
				poemId: data.poemId,
			},
		}),

	invalidate: [poemKeys.collections],
});

const removeItemFromCollection = createMutationEndpoint<CollectionItemBody, void>({
	fn: (data) =>
		createHTTPRequest<void, { poemId: number }>({
			method: 'DELETE',
			path: `/poems/collections/${data.collectionId}/items`,
			body: {
				poemId: data.poemId,
			},
		}),

	invalidate: [poemKeys.collections],
});

const deleteCollection = createMutationEndpoint<string, void>({
	fn: (collectionId) =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/poems/collections/${collectionId}`,
		}),

	invalidate: [poemKeys.collections],
});

export const poems = {
	createPoem,
	getPoem,
	getPoems,
	getMyPoems,
	getAuthorPoems,
	getSavedPoems,
	getCollections,
	updatePoem,
	deletePoem,
	requestPoemAudioUploadUrl,
	updatePoemAudio,
	savePoem,
	removeSavedPoem,
	createCollection,
	addItemToCollection,
	removeItemFromCollection,
	deleteCollection,
};
