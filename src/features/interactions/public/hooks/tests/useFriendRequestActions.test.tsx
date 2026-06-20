// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requesterId } from './fixtures';
import { makeFriendRequestActionsScenario } from './makeFriendRequestScenarios';

describe('FEATURE HOOK - Interactions - useFriendRequestActions', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('accepts a request, updates the requester profile, and hides it after the exit delay', async () => {
		vi.useFakeTimers();
		const scenario = makeFriendRequestActionsScenario();
		scenario.asAuthenticatedUser();
		scenario.withRequesterProfile();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.acceptRequest(requesterId);
		});

		expect(scenario.friendsActionsPort.acceptFriendRequest).toHaveBeenCalledWith(requesterId);
		expect(scenario.getCachedRequesterProfile()).toEqual(
			expect.objectContaining({
				hasIncomingFriendRequest: false,
				isFriend: true,
			}),
		);
		expect(result.current.isRemovingRequester(requesterId)).toBe(true);

		act(() => {
			vi.advanceTimersByTime(221);
		});

		expect(result.current.isHiddenRequester(requesterId)).toBe(true);
		expect(result.current.isRemovingRequester(requesterId)).toBe(false);
	});

	it('rejects a request without marking the requester as a friend', async () => {
		const scenario = makeFriendRequestActionsScenario();
		scenario.asAuthenticatedUser();
		scenario.withRequesterProfile();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.rejectRequest(requesterId);
		});

		expect(scenario.friendsActionsPort.rejectFriendRequest).toHaveBeenCalledWith(requesterId);
		expect(scenario.getCachedRequesterProfile()).toEqual(
			expect.objectContaining({
				hasIncomingFriendRequest: false,
				isFriend: false,
			}),
		);
	});

	it('restores the requester profile and visible state when accepting fails', async () => {
		const scenario = makeFriendRequestActionsScenario();
		scenario.asAuthenticatedUser();
		scenario.withRequesterProfile();
		scenario.withAcceptFailure({ statusCode: 404 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.acceptRequest(requesterId);
			}),
		).rejects.toMatchObject({ statusCode: 404 });

		expect(scenario.getCachedRequesterProfile()).toEqual(
			expect.objectContaining({
				hasIncomingFriendRequest: true,
				isFriend: false,
			}),
		);
		expect(result.current.isRemovingRequester(requesterId)).toBe(false);
		expect(result.current.isHiddenRequester(requesterId)).toBe(false);
		await waitFor(() => expect(result.current.errorMessage).toBe('Request not found.'));
	});
});
