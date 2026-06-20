// @vitest-environment happy-dom
import { eventBus } from '@root/core/events/eventBus';
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authorId, authorProfile } from './fixtures';
import { makeCancelFriendRequestScenario } from './makeFriendRequestScenarios';

describe('FEATURE HOOK - Interactions - useCancelFriendRequest', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('clears requester state and publishes cancel events', async () => {
		const publishSpy = vi.spyOn(eventBus, 'publish').mockResolvedValue();
		const scenario = makeCancelFriendRequestScenario();
		scenario.asAuthenticatedUser();
		scenario.withAuthorProfile({
			...authorProfile,
			isFriendRequester: true,
		});

		const { result } = scenario.render();

		await act(async () => {
			await result.current.cancelFriendRequest(authorId);
		});

		expect(scenario.friendsActionsPort.cancelFriendRequest).toHaveBeenCalledWith(authorId);
		expect(scenario.getCachedProfile()).toEqual(
			expect.objectContaining({
				isFriendRequester: false,
			}),
		);
		expect(publishSpy).toHaveBeenCalledWith(
			'friendRequestCanceled',
			expect.objectContaining({ authorId }),
		);
		expect(publishSpy).toHaveBeenCalledWith(
			'friendRequestCancelSettled',
			expect.objectContaining({ authorId }),
		);
	});

	it('restores requester state when cancel fails', async () => {
		const scenario = makeCancelFriendRequestScenario();
		scenario.asAuthenticatedUser();
		scenario.withAuthorProfile({
			...authorProfile,
			isFriendRequester: true,
		});
		scenario.withCancelFailure({ statusCode: 404 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.cancelFriendRequest(authorId);
			}),
		).rejects.toMatchObject({ statusCode: 404 });

		expect(scenario.getCachedProfile()).toEqual(
			expect.objectContaining({
				isFriendRequester: true,
			}),
		);
		await waitFor(() => expect(result.current.errorMessage).toBe('Request not found.'));
	});
});
