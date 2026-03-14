import { createHTTPRequest } from "@root/features/base";
import { createMutationEndpoint } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

const login = createMutationEndpoint({
  fn: (data: { email: string; password: string }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/auth/login`,
      body: data,
    }),
});

export const auth = {
  login,
};
