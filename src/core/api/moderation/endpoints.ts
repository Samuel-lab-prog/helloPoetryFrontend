import { createHTTPRequest } from "@root/features/base";
import { createMutationEndpoint } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

const banUser = createMutationEndpoint({
  fn: (data: { userId: string; reason: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/moderation/ban/${data.userId}`,
      body: {
        reason: data.reason,
      },
    }),
});

const suspendUser = createMutationEndpoint({
  fn: (data: { userId: string; reason: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/moderation/suspend/${data.userId}`,
      body: {
        reason: data.reason,
      },
    }),
});

export const moderation = {
  banUser,
  suspendUser,
};
