// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authorId } from './fixtures';
import { makeSendFriendRequestScenario } from './makeFriendRequestScenarios';

describe('FEATURE HOOK - Interactions - useSendFriendRequest', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('marks the author profile as requested optimistically', async () => {
		const scenario = makeSendFriendRequestScenario();
		scenario.asAuthenticatedUser();
		scenario.withAuthorProfile();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.sendFriendRequest(authorId);
		});

		expect(scenario.friendsActionsPort.sendFriendRequest).toHaveBeenCalledWith(authorId);
		expect(scenario.getCachedProfile()).toEqual(
			expect.objectContaining({
				isFriendRequester: true,
				hasIncomingFriendRequest: false,
			}),
		);
	});

	it('restores the author profile and exposes a clear error when sending fails', async () => {
		const scenario = makeSendFriendRequestScenario();
		scenario.asAuthenticatedUser();
		scenario.withAuthorProfile();
		scenario.withSendFailure({ statusCode: 403 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.sendFriendRequest(authorId);
			}),
		).rejects.toMatchObject({ statusCode: 403 });

		expect(scenario.getCachedProfile()).toEqual(
			expect.objectContaining({
				isFriendRequester: false,
				hasIncomingFriendRequest: true,
			}),
		);
		await waitFor(() =>
			expect(result.current.errorMessage).toBe('You cannot send a request to this user.'),
		);
	});
});
