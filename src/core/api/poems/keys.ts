import { createQueryKeys } from "../utils";

export const poemKeys = createQueryKeys({
  all: () => ["poems"] as const,
  byId: (id: string) => ["poem", id] as const,
});