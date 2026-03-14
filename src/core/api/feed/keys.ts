import { createQueryKeys } from "../utils";

export const feedKeys = createQueryKeys({
  all: () => ["feed"] as const,
});
