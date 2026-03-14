import { createHTTPRequest } from "@root/features/base";
import {
  createMutationEndpoint,
  createQueryEndpoint
} from "../utils";

import { interactionsKeys } from "./keys";

const API_URL = import.meta.env.VITE_API_URL;

const getPoemComments = createQueryEndpoint({
  key: interactionsKeys.commentsByPoem,

  fn: (poemId: string, parentId?: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/interactions/poems/${poemId}/comments`,
      query: { parentId },
    }),
});

const likePoem = createMutationEndpoint({
  fn: (poemId: string) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/interactions/poems/${poemId}/like`,
    }),
});

const unlikePoem = createMutationEndpoint({
  fn: (poemId: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/interactions/poems/${poemId}/like`,
    }),
});

const commentPoem = createMutationEndpoint({
  fn: (data: { poemId: string; content: string; parentId?: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/interactions/poems/${data.poemId}/comments`,
      body: {
        content: data.content,
        parentId: data.parentId,
      },
    }),
});

const deleteComment = createMutationEndpoint({
  fn: (commentId: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/interactions/comments/${commentId}`,
    }),
});

const likeComment = createMutationEndpoint({
  fn: (commentId: string) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/interactions/comments/${commentId}/like`,
    }),
});

const unlikeComment = createMutationEndpoint({
  fn: (commentId: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/interactions/comments/${commentId}/like`,
    }),
});

const updateComment = createMutationEndpoint({
  fn: (data: { commentId: string; content: string }) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/interactions/comments/${data.commentId}`,
      body: {
        content: data.content,
      },
    }),
});

export const interactions = {
  getPoemComments,
  likePoem,
  unlikePoem,
  commentPoem,
  deleteComment,
  likeComment,
  unlikeComment,
  updateComment,
};
