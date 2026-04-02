/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FetchQueryOptions } from '@tanstack/react-query';
import { queryClient } from '../queryClient';

export function createQueryKeys<T extends Record<string, (...args: any[]) => readonly unknown[]>>(
	keys: T,
) {
	return keys;
}

type QueryFactoryConfig<TArgs extends unknown[], TResult> = {
	key: (...args: TArgs) => readonly unknown[];
	fn: (...args: TArgs) => Promise<TResult>;
	options?: Record<string, unknown>;
};

/**
 * Builds a query endpoint wrapper compatible with TanStack Query.
 *
 * Provides helpers for:
 * - creating query configs,
 * - fetching/prefetching,
 * - cache invalidation,
 * - cache reads/writes,
 * - optimistic updates.
 */
export function createQueryEndpoint<TArgs extends unknown[], TResult>(
	config: QueryFactoryConfig<TArgs, TResult>,
) {
	const query = (...args: TArgs) => ({
		queryKey: config.key(...args),
		queryFn: () => config.fn(...args),
		...(config.options ?? {}),
	});

	return {
		/**
		 * Returns the query config object expected by TanStack Query.
		 */
		query,

		/**
		 * Fetches data immediately using the shared query client.
		 * Accepts optional query options as the last argument.
		 */
		fetch: (...args: [...TArgs, FetchQueryOptions<TResult>?]) => {
			const maybeOptions = args.at(-1);
			const hasOptions =
				typeof maybeOptions === 'object' && maybeOptions !== null && !Array.isArray(maybeOptions);

			const params = (hasOptions ? args.slice(0, -1) : args) as TArgs;
			const options = (hasOptions ? maybeOptions : {}) as FetchQueryOptions<TResult>;

			return queryClient.fetchQuery({
				...query(...params),
				...options,
			});
		},

		/**
		 * Prefetches data into the cache.
		 */
		prefetch: (...args: TArgs) => queryClient.prefetchQuery(query(...args)),

		/**
		 * Invalidates the cached query for the given arguments.
		 */
		invalidate: (...args: TArgs) =>
			queryClient.invalidateQueries({
				queryKey: config.key(...args),
			}),

		/**
		 * Refetches the cached query for the given arguments.
		 */
		refetch: (...args: TArgs) =>
			queryClient.refetchQueries({
				queryKey: config.key(...args),
			}),

		/**
		 * Removes the cached query for the given arguments.
		 */
		remove: (...args: TArgs) =>
			queryClient.removeQueries({
				queryKey: config.key(...args),
			}),

		/**
		 * Reads the cached data for the given arguments.
		 */
		getCache: (...args: TArgs) => queryClient.getQueryData<TResult>(config.key(...args)),

		/**
		 * Sets the cached data for the given arguments.
		 */
		setCache: (...args: [...TArgs, TResult]) => {
			const data = args.at(-1) as TResult;
			const params = args.slice(0, -1) as unknown as TArgs;

			queryClient.setQueryData(config.key(...params), data);
		},

		/**
		 * Applies an optimistic update to the cached data for the given arguments.
		 */
		optimisticUpdate(args: TArgs, updater: (current: TResult | undefined) => TResult) {
			const key = config.key(...args);

			queryClient.setQueryData<TResult>(key, updater);
		},

		/**
		 * Returns the base query key for this endpoint.
		 */
		getKey: () => config.key(...([] as unknown as TArgs)),
	};
}

type MutationFactoryConfig<TInput, TResult> = {
	fn: (input: TInput) => Promise<TResult>;
	invalidate?: Array<() => readonly unknown[]>;
};

/**
 * Builds a mutation endpoint wrapper with optional post-mutation invalidation.
 */
export function createMutationEndpoint<TInput, TResult>(
	config: MutationFactoryConfig<TInput, TResult>,
) {
	return {
		/**
		 * Executes the mutation and invalidates configured query keys.
		 */
		async mutate(input: TInput) {
			const result = await config.fn(input);

			if (config.invalidate?.length) {
				await Promise.all(
					config.invalidate.map((getKey) =>
						queryClient.invalidateQueries({
							queryKey: getKey(),
						}),
					),
				);
			}

			return result;
		},
	};
}

/**
 * Invalidates multiple query keys in parallel.
 */
export async function invalidateMany(...keys: Array<readonly unknown[]>) {
	await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
}
