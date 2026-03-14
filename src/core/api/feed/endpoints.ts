import { createHTTPRequest } from "@root/features/base";
import { createQueryEndpoint } from "../utils";

import { feedKeys } from "./keys";

const API_URL = import.meta.env.VITE_API_URL;

const getFeed = createQueryEndpoint({
  key: feedKeys.all,

  fn: () =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/feed`,
    }),
});

export const feed = {
  getFeed,
};
