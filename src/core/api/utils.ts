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

export function createQueryEndpoint<TArgs extends unknown[], TResult>(
	config: QueryFactoryConfig<TArgs, TResult>,
) {
	const query = (...args: TArgs) => ({
		queryKey: config.key(...args),
		queryFn: () => config.fn(...args),
		...(config.options ?? {}),
	});

	return {
		query,

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

		prefetch: (...args: TArgs) => queryClient.prefetchQuery(query(...args)),

		invalidate: (...args: TArgs) =>
			queryClient.invalidateQueries({
				queryKey: config.key(...args),
			}),

		refetch: (...args: TArgs) =>
			queryClient.refetchQueries({
				queryKey: config.key(...args),
			}),

		remove: (...args: TArgs) =>
			queryClient.removeQueries({
				queryKey: config.key(...args),
			}),

		getCache: (...args: TArgs) => queryClient.getQueryData<TResult>(config.key(...args)),

		setCache: (...args: [...TArgs, TResult]) => {
			const data = args.at(-1) as TResult;
			const params = args.slice(0, -1) as unknown as TArgs;

			queryClient.setQueryData(config.key(...params), data);
		},

		optimisticUpdate(args: TArgs, updater: (current: TResult | undefined) => TResult) {
			const key = config.key(...args);

			queryClient.setQueryData<TResult>(key, updater);
		},
	};
}

type MutationFactoryConfig<TInput, TResult> = {
	fn: (input: TInput) => Promise<TResult>;
	invalidate?: Array<() => readonly unknown[]>;
};

export function createMutationEndpoint<TInput, TResult>(
	config: MutationFactoryConfig<TInput, TResult>,
) {
	return {
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

export async function invalidateMany(...keys: Array<readonly unknown[]>) {
	await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
}
