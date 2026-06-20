// @vitest-environment happy-dom
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { approvePoemInput, banInput } from './fixtures';
import { makeModerationActionsScenario } from './makeModerationActionsScenario';

describe('FEATURE HOOK - Moderation - useModerationActions', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('executes a user moderation action with normalized input and success feedback', async () => {
		const scenario = makeModerationActionsScenario().withBanSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.executeAction(banInput);
		});

		expect(scenario.mocks.banUser).toHaveBeenCalledWith({
			userId: '77',
			reason: 'repeated abuse',
		});
		expect(scenario.mocks.invalidateQueries).toHaveBeenCalled();
		expect(scenario.mocks.toaster).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'success',
				title: 'User banned',
			}),
		);
		expect(scenario.mocks.onActionComplete).toHaveBeenCalledWith(
			expect.objectContaining({
				action: 'ban-user',
				user: banInput.user,
			}),
		);
	});

	it('does not execute a user action without a target user', async () => {
		const scenario = makeModerationActionsScenario().withBanSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.executeAction({
				action: 'ban-user',
				reason: 'missing target',
			});
		});

		expect(scenario.mocks.banUser).not.toHaveBeenCalled();
		expect(scenario.mocks.toaster).not.toHaveBeenCalled();
	});

	it('shows a clear error toast when a poem moderation action fails', async () => {
		const scenario = makeModerationActionsScenario().withPoemModerationFailure({
			statusCode: 403,
			message: 'moderator is suspended',
		});

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.executeAction(approvePoemInput);
			}),
		).rejects.toMatchObject({ statusCode: 403 });

		expect(scenario.mocks.moderatePoem).toHaveBeenCalledWith({
			poemId: '44',
			moderationStatus: 'approved',
			reason: undefined,
		});
		expect(scenario.mocks.toaster).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'error',
				title: 'Could not approve poem',
				description: 'moderator is suspended',
			}),
		);
	});
});
