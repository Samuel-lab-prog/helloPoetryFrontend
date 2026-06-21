// @vitest-environment happy-dom
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pendingPoem } from './fixtures';
import { makePoemModerationDataScenario } from './makePoemModerationDataScenario';

describe('FEATURE HOOK - Moderation - usePoemModerationData', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('loads pending poems and hides a moderated poem after the exit delay', async () => {
		const scenario = makePoemModerationDataScenario().withPendingPoems().withModerationSuccess();

		const { result } = scenario.render();

		expect(result.current.pendingPoems).toHaveLength(1);
		vi.useFakeTimers();

		await act(async () => {
			await result.current.handleModeration(pendingPoem.id, 'approved');
		});

		expect(scenario.mocks.moderatePoem).toHaveBeenCalledWith({
			poemId: String(pendingPoem.id),
			moderationStatus: 'approved',
			reason: undefined,
		});
		expect(result.current.isRemovingPoem(pendingPoem.id)).toBe(true);

		act(() => {
			vi.advanceTimersByTime(221);
		});

		expect(result.current.pendingPoems).toEqual([]);
		expect(result.current.isRemovingPoem(pendingPoem.id)).toBe(false);
	});

	it('restores the poem and shows an error toast when moderation fails', async () => {
		const scenario = makePoemModerationDataScenario()
			.withPendingPoems()
			.withModerationFailure({ statusCode: 403, message: 'suspended moderator' });

		const { result } = scenario.render();

		await waitFor(() => expect(result.current.pendingPoems).toHaveLength(1));

		await act(async () => {
			await result.current.handleModeration(pendingPoem.id, 'rejected', 'Needs changes');
		});

		expect(result.current.pendingPoems).toEqual([pendingPoem]);
		expect(result.current.isRemovingPoem(pendingPoem.id)).toBe(false);
		expect(scenario.mocks.toaster).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'error',
				title: 'Could not reject poem',
				description: expect.stringContaining('moderate poems'),
			}),
		);
	});
});
