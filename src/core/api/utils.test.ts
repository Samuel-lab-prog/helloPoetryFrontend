/* eslint-disable require-await */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../queryClient';
import {
	createMutationEndpoint,
	createQueryEndpoint,
	createQueryKeys,
	invalidateMany,
} from './utils';

describe('UTIL - API Utils', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('createQueryKeys returns the same object', () => {
		const keys = createQueryKeys({
			user: (id: string) => ['user', id] as const,
		});

		expect(keys.user('1')).toEqual(['user', '1']);
	});

	it('createQueryEndpoint.query builds a query config', () => {
		const endpoint = createQueryEndpoint({
			key: (id: string) => ['user', id] as const,
			fn: async (id: string) => `user-${id}`,
		});

		const config = endpoint.query('123');
		expect(config.queryKey).toEqual(['user', '123']);
		expect(config.queryFn).toBeInstanceOf(Function);
	});

	it('createQueryEndpoint.fetch merges options and calls fetchQuery', async () => {
		const fetchSpy = vi.spyOn(queryClient, 'fetchQuery').mockResolvedValue('ok');
		const endpoint = createQueryEndpoint({
			key: (id: string) => ['user', id] as const,
			fn: async (id: string) => `user-${id}`,
		});

		await endpoint.fetch('42', { staleTime: 123, queryKey: ['user', '42'] } as const);

		expect(fetchSpy).toHaveBeenCalledWith({
			queryKey: ['user', '42'],
			queryFn: expect.any(Function),
			staleTime: 123,
		});
	});

	it('createQueryEndpoint cache helpers call queryClient methods', () => {
		const endpoint = createQueryEndpoint({
			key: (id: string) => ['user', id] as const,
			fn: async (id: string) => `user-${id}`,
		});

		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
		const refetchSpy = vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue();
		const removeSpy = vi.spyOn(queryClient, 'removeQueries').mockResolvedValue();
		const getSpy = vi.spyOn(queryClient, 'getQueryData').mockReturnValue('cached');
		const setSpy = vi.spyOn(queryClient, 'setQueryData').mockReturnValue(undefined);

		endpoint.invalidate('1');
		endpoint.refetch('1');
		endpoint.remove('1');
		endpoint.getCache('1');
		endpoint.setCache('1', 'payload');
		endpoint.optimisticUpdate(['1'], () => 'next');

		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', '1'] });
		expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['user', '1'] });
		expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['user', '1'] });
		expect(getSpy).toHaveBeenCalledWith(['user', '1']);
		expect(setSpy).toHaveBeenCalled();
	});

	it('createMutationEndpoint invalidates keys after mutate', async () => {
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

		const endpoint = createMutationEndpoint({
			fn: async (payload: string) => `done-${payload}`,
			invalidate: [() => ['users'] as const, () => ['posts'] as const],
		});

		const result = await endpoint.mutate('ok');

		expect(result).toBe('done-ok');
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] });
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts'] });
	});

	it('invalidateMany invalidates each key', async () => {
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

		await invalidateMany(['a'], ['b', 1]);

		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['a'] });
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['b', 1] });
	});
});
