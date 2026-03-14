import { createHTTPRequest } from "@root/features/base";
import {
  createMutationEndpoint,
  createQueryEndpoint
} from "../utils";

import { poemKeys } from "./keys";

const API_URL = import.meta.env.VITE_API_URL;

const createPoem = createMutationEndpoint({
  fn: (data: { title: string; content: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/poems`,
      body: data,
    }),

  invalidate: [
    poemKeys.all,
    poemKeys.mine
  ],
});

const getPoem = createQueryEndpoint({
  key: poemKeys.byId,

  fn: (id: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems/${id}`,
    }),
});

const getMyPoems = createQueryEndpoint({
  key: poemKeys.mine,

  fn: () =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems/me`,
    }),
});

const getAuthorPoems = createQueryEndpoint({
  key: poemKeys.byAuthor,

  fn: (authorId: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems/authors/${authorId}`,
    }),
});

const getPoems = createQueryEndpoint({
  key: poemKeys.search,

  fn: (params: {
    limit?: number;
    cursor?: number;
    searchTitle?: string;
    tags?: string[];
    orderBy?: "createdAt" | "title";
    orderDirection?: "asc" | "desc";
  } = {}) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems`,
      query: params,
    }),
});

const getSavedPoems = createQueryEndpoint({
  key: poemKeys.saved,

  fn: () =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems/saved`,
    }),
});

const getCollections = createQueryEndpoint({
  key: poemKeys.collections,

  fn: () =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems/collections`,
    }),
});

const updatePoem = createMutationEndpoint({
  fn: (data: { id: string; title?: string; content?: string }) =>
    createHTTPRequest({
      method: "PUT",
      path: `${API_URL}/poems/${data.id}`,
      body: {
        title: data.title,
        content: data.content,
      },
    }),

  invalidate: [
    poemKeys.all,
    poemKeys.mine
  ],
});

const deletePoem = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/poems/${id}`,
    }),

  invalidate: [
    poemKeys.all,
    poemKeys.mine
  ],
});

const savePoem = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/poems/${id}/save`,
    }),

  invalidate: [
    poemKeys.saved
  ],
});

const removeSavedPoem = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/poems/${id}/save`,
    }),

  invalidate: [
    poemKeys.saved
  ],
});

const createCollection = createMutationEndpoint({
  fn: (data: { userId: string; name: string; description: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/poems/collections`,
      body: data,
    }),

  invalidate: [
    poemKeys.collections
  ],
});

const addItemToCollection = createMutationEndpoint({
  fn: (data: { collectionId: string; poemId: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/poems/collections/${data.collectionId}/items`,
      body: {
        poemId: data.poemId,
      },
    }),

  invalidate: [
    poemKeys.collections
  ],
});

const removeItemFromCollection = createMutationEndpoint({
  fn: (data: { collectionId: string; poemId: string }) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/poems/collections/${data.collectionId}/items`,
      body: {
        poemId: data.poemId,
      },
    }),

  invalidate: [
    poemKeys.collections
  ],
});

const deleteCollection = createMutationEndpoint({
  fn: (collectionId: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/poems/collections/${collectionId}`,
    }),

  invalidate: [
    poemKeys.collections
  ],
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
  savePoem,
  removeSavedPoem,
  createCollection,
  addItemToCollection,
  removeItemFromCollection,
  deleteCollection,
};

await poems.getPoem.fetch("123");
