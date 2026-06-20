// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeHomeFeedScenario } from './makeHomeFeedScenario';

describe('FEATURE HOOK - Feed - useHomeFeed', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('uses recent poems for logged-out visitors', async () => {
		const scenario = makeHomeFeedScenario()
			.asLoggedOutVisitor()
			.withRecentPoems()
			.watchingPersonalizedFeed();

		const { result } = scenario.renderLoggedOut({ limit: 4 });

		await waitFor(() => expect(result.current.poems).toHaveLength(1));

		expect(result.current.poems[0]?.title).toBe('Recent poem');
		expect(result.current.isPersonalizedFeed).toBe(false);
		expect(scenario.mocks.getRecentPoems).toHaveBeenCalledWith({ limit: 4 });
		expect(scenario.mocks.feedQuery).not.toHaveBeenCalled();
	});

	it('uses the personalized feed for authenticated users', async () => {
		const scenario = makeHomeFeedScenario()
			.asAuthenticatedUser()
			.withRecentPoems()
			.withPersonalizedFeed();

		const { result } = scenario.renderAuthenticated({ limit: 8 });

		await waitFor(() => expect(result.current.isPersonalizedFeed).toBe(true));

		expect(result.current.poems).toEqual([
			expect.objectContaining({
				id: 2,
				title: 'Personalized poem',
				tags: [
					{ id: 1, name: 'personal' },
					{ id: 2, name: 'feed' },
				],
			}),
		]);
		expect(scenario.mocks.getRecentPoems).not.toHaveBeenCalled();
	});

	it('falls back to recent poems when the personalized feed is not available', async () => {
		const scenario = makeHomeFeedScenario()
			.asAuthenticatedUser()
			.withRecentPoems()
			.withUnavailablePersonalizedFeed();

		const { result } = scenario.renderAuthenticated({ limit: 6 });

		await waitFor(() => expect(result.current.poems).toHaveLength(1));

		expect(result.current.poems[0]?.title).toBe('Recent poem');
		expect(result.current.isPersonalizedFeed).toBe(false);
		expect(scenario.mocks.getRecentPoems).toHaveBeenCalledWith({ limit: 6 });
	});
});
