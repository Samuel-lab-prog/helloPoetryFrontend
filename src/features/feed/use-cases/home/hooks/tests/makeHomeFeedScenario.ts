import { feed } from '@Api/feed/endpoints';
import type { FeedPoem } from '@Api/feed/types';
import type { PaginatedPoemsType, PoemPreviewType } from '@features/poems/public/types';
import { registerPoemsQueryPort } from '@root/core/ports/poems';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useHomeFeed } from '../useHomeFeed';
import { feedPoem, recentPoem } from './fixtures';

function mockRecentPoems(poems: PoemPreviewType[] = [recentPoem]) {
	const getRecentPoems = vi.fn(
		({ limit }: { limit: number }): Promise<PaginatedPoemsType> =>
			Promise.resolve({
				hasMore: false,
				nextCursor: null,
				poems: poems.slice(0, limit),
			}),
	);

	registerPoemsQueryPort({
		getRecentPoems,
		getSearchQueryOptions: () => {
			throw new Error('Search poems should not be used by useHomeFeed.');
		},
	});

	return getRecentPoems;
}

export function makeHomeFeedScenario() {
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {} as Record<string, unknown>,
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return scenario;
		},
		asAuthenticatedUser() {
			setTestAuthClient();
			return scenario;
		},
		withRecentPoems(poems: PoemPreviewType[] = [recentPoem]) {
			scenario.mocks.getRecentPoems = mockRecentPoems(poems);
			return scenario;
		},
		withPersonalizedFeed(poems: FeedPoem[] = [feedPoem]) {
			scenario.mocks.feedQuery = vi.spyOn(feed.getFeed, 'query').mockReturnValue({
				queryKey: ['feed'],
				queryFn: () => Promise.resolve(poems),
			});
			return scenario;
		},
		withUnavailablePersonalizedFeed(statusCode = 404) {
			scenario.mocks.feedQuery = vi.spyOn(feed.getFeed, 'query').mockReturnValue({
				queryKey: ['feed'],
				queryFn: () => Promise.reject({ statusCode }),
			});
			return scenario;
		},
		watchingPersonalizedFeed() {
			scenario.mocks.feedQuery = vi.spyOn(feed.getFeed, 'query');
			return scenario;
		},
		renderLoggedOut(options: { limit?: number } = {}) {
			return scenario.render({ isAuthenticated: false, limit: options.limit });
		},
		renderAuthenticated(options: { limit?: number } = {}) {
			return scenario.render({ isAuthenticated: true, limit: options.limit });
		},
		render(options: { isAuthenticated: boolean; limit?: number }) {
			return renderHook(
				() =>
					useHomeFeed({
						isAuthenticated: options.isAuthenticated,
						limit: options.limit,
					}),
				{
					wrapper: createQueryClientWrapper(queryClient),
				},
			);
		},
	};

	return scenario;
}
