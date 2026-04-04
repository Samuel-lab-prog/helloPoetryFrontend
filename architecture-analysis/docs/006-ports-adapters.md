# Ports and Adapters Pattern (Frontend)

This document describes the ports/adapters pattern used to avoid cross-domain imports in the
frontend. It explains the motivation, structure, and how to implement new ports.

## Why this exists

We want domain isolation:

- A domain should not import another domain's internal API (especially `api/*` and `keys`).
- When a domain needs something from another domain, it should depend on a stable contract (a
  **port**) instead of the implementation.

This reduces coupling and stops cross-domain violations in `bun metrics`.

## High level flow

1. **Core defines a port** (contract)
2. **Domain implements an adapter** (real implementation)
3. **App registers the adapter** at startup
4. **Consumers use the port**, never importing `api/*` from other domains

```
consumer domain -> core port -> provider adapter -> provider api
```

## Folder layout

- Ports live in:
  - `frontend/src/core/ports`
- Adapters live in the provider domain:
  - `frontend/src/features/<domain>/adapters`

`adapters` is allowed by the folder structure rules.

## Example: poems queries

### Port (core)

File: `frontend/src/core/ports/poems.ts`

```ts
export type PoemsQueryPort = {
	getSearchQueryOptions: (params: SearchPoemsParams) => QueryOptions<PaginatedPoemsType>;
	getRecentPoems: (params: { limit: number }) => Promise<PaginatedPoemsType>;
};
```

### Adapter (poems)

File: `frontend/src/features/poems/adapters/poemsQueryPort.ts`

```ts
export const poemsQueryPort: PoemsQueryPort = {
	getSearchQueryOptions(params) {
		const query = poems.getPoems.query(params);
		return {
			queryKey: poemKeys.search(params),
			queryFn: async () => (await query.queryFn()) as PaginatedPoemsType,
		};
	},
	async getRecentPoems({ limit }) {
		const query = poems.getPoems.query({ limit, orderBy: 'createdAt', orderDirection: 'desc' });
		return (await query.queryFn()) as PaginatedPoemsType;
	},
};
```

### Registration (app boot)

File: `frontend/src/main.tsx`

```ts
registerPoemsQueryPort(poemsQueryPort);
```

### Usage (consumer)

File: `frontend/src/features/feed/use-cases/home/Page.tsx`

```ts
const poemsQueryPort = getPoemsQueryPort();
const searchQuery = useQuery({
	...poemsQueryPort.getSearchQueryOptions({
		limit: 8,
		searchTitle,
		orderBy: 'createdAt',
		orderDirection: 'desc',
	}),
	enabled: isSearching,
});
```

## Ports for query keys

Sometimes a consumer only needs **query keys** to invalidate or optimistically update cache. Those
keys belong to the provider domain.

Instead of importing `@features/<domain>/api/keys`, use a **keys/cache port**.

Example:

- Port: `frontend/src/core/ports/poems.ts`
  - `PoemsCachePort.getPoemKey(poemId)`
- Adapter: `frontend/src/features/poems/adapters/poemsCachePort.ts`
  - uses `poemKeys.byId(...)`

This is not a new cache. It is a safe way to access keys without cross-domain imports.

## Example: friends actions

### Port

File: `frontend/src/core/ports/friends.ts`

```ts
export type FriendsActionsPort = {
	sendFriendRequest: (authorId: number) => Promise<FriendRequestResult>;
	cancelFriendRequest: (authorId: number) => Promise<void>;
	acceptFriendRequest: (requesterId: number) => Promise<void>;
	rejectFriendRequest: (requesterId: number) => Promise<void>;
	getRequestsKey: () => readonly unknown[];
};
```

### Adapter

File: `frontend/src/features/friends/adapters/friendsActionsPort.ts`

```ts
export const friendsActionsPort: FriendsActionsPort = {
	sendFriendRequest: (authorId) => friends.sendFriendRequest.mutate(String(authorId)),
	cancelFriendRequest: async (authorId) => {
		await friends.cancelFriendRequest.mutate(String(authorId));
	},
	acceptFriendRequest: async (requesterId) => {
		await friends.acceptFriendRequest.mutate(String(requesterId));
	},
	rejectFriendRequest: async (requesterId) => {
		await friends.rejectFriendRequest.mutate(String(requesterId));
	},
	getRequestsKey: () => friendsKeys.requests(),
};
```

### Registration

File: `frontend/src/main.tsx`

```ts
registerFriendsActionsPort(friendsActionsPort);
```

### Usage (consumer)

File: `frontend/src/features/interactions/public/hooks/useFriendRequestActions.ts`

```ts
const friendsActionsPort = getFriendsActionsPort();
const usersCachePort = getUsersCachePort();

const acceptMutation = useMutation({
	mutationFn: (id) => friendsActionsPort.acceptFriendRequest(id),
	onMutate: async (id) => {
		const queryKey = usersCachePort.getProfileKey(id);
		await queryClient.cancelQueries({ queryKey });
		// ...
	},
});
```

## When to add a port

Use a port when:

- A domain needs to call another domain's `api/*` or `keys`.
- A hook or component in one domain imports from another domain's `api/*`.

## When NOT to add a port

No need for ports when:

- You are importing from another domain's `public/*` (this is already allowed).
- The dependency is purely a shared component or utility in `core/*`.

## Implementation checklist

1. Create a new port in `frontend/src/core/ports/<name>.ts`.
2. Implement adapter in `frontend/src/features/<provider>/adapters/<name>.ts`.
3. Register the adapter in `frontend/src/main.tsx`.
4. Replace cross-domain imports in consumer with `get<PortName>()`.
5. Run `bun run metrics` to confirm no cross-domain violations.

## Naming conventions

- Port files use domain name: `friends.ts`, `poems.ts`, `users.ts`.
- Adapter files describe purpose: `friendsActionsPort.ts`, `poemsQueryPort.ts`, `poemsCachePort.ts`.
- Exposed functions start with `get` / `register`.

## Troubleshooting

- If you get `Port not registered` error:
  - Check `main.tsx` registration.
  - Ensure adapter file is imported correctly.

- If you still see cross-domain violations:
  - Find the `api/*` or `keys` import.
  - Replace it with a port method.

## Related rules

- `Rules � Cross-domain violations`
- `Rules � Feature folder structure violations`

These are checked in `bun run metrics`.
