// @vitest-environment happy-dom
import { bannedAccessError } from '@root/core/testing/appErrors';
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fullPoem, likedPoemId } from './fixtures';
import { makePoemLikeScenario } from './makePoemLikeScenario';

describe('FEATURE HOOK - Interactions - usePoemLike', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('likes a poem optimistically in the cached poem detail', async () => {
		const scenario = makePoemLikeScenario()
			.asAuthenticatedUser()
			.withCachedPoem()
			.withLikeSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.likePoem();
		});

		expect(scenario.mocks.likePoem).toHaveBeenCalledWith(String(likedPoemId));
		expect(scenario.getCachedPoem()?.stats).toEqual(
			expect.objectContaining({
				likedByCurrentUser: true,
				likesCount: 4,
			}),
		);
	});

	it('restores the cached poem when unlike fails', async () => {
		const likedPoem = {
			...fullPoem,
			stats: {
				...fullPoem.stats,
				likedByCurrentUser: true,
				likesCount: 4,
			},
		};
		const scenario = makePoemLikeScenario()
			.asAuthenticatedUser()
			.withCachedPoem(likedPoem)
			.withUnlikeFailure({ statusCode: 403 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.unlikePoem();
			}),
		).rejects.toMatchObject({ statusCode: 403 });

		expect(scenario.getCachedPoem()?.stats).toEqual(likedPoem.stats);
		await waitFor(() => expect(result.current.likeError).toBe('You cannot like this poem.'));
	});

	it('shows banned-user copy and restores the cached poem when liking is blocked', async () => {
		const scenario = makePoemLikeScenario()
			.asBannedUser()
			.withCachedPoem()
			.withLikeFailure(bannedAccessError);

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.likePoem();
			}),
		).rejects.toMatchObject({ statusCode: 401 });

		expect(scenario.getCachedPoem()?.stats).toEqual(fullPoem.stats);
		await waitFor(() =>
			expect(result.current.likeError).toContain(
				"This account has been banned, so you can't like poems.",
			),
		);
	});

	it('keeps the optimistic state for idempotent conflict responses', async () => {
		const scenario = makePoemLikeScenario()
			.asAuthenticatedUser()
			.withCachedPoem()
			.withLikeFailure({ statusCode: 409 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.likePoem();
			}),
		).rejects.toMatchObject({ statusCode: 409 });

		expect(scenario.getCachedPoem()?.stats).toEqual(
			expect.objectContaining({
				likedByCurrentUser: true,
				likesCount: 4,
			}),
		);
		expect(result.current.likeError).toBe('');
	});
});
