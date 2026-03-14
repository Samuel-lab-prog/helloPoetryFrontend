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
    poemKeys.all
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

const getPoems = createQueryEndpoint({
  key: poemKeys.all,

  fn: () =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/poems`,
    }),
});

export const poems = {
  createPoem,
  getPoem,
  getPoems,
};

await poems.getPoem.fetch("123");