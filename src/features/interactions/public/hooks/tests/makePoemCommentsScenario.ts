import { interactions } from '@Api/interactions/endpoints';
import { interactionsKeys } from '@Api/interactions/keys';
import { eventBus } from '@root/core/events/eventBus';
import { registerPoemsCachePort } from '@root/core/ports/poems';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { type PoemCommentType, usePoemComments } from '../usePoemComments';
import {
	commentPage,
	type InfiniteComments,
	poemId,
	replyComment,
	rootComment,
	seedRootComments,
} from './fixtures';

function mockCommentsQuery(comments: PoemCommentType[] = [rootComment]) {
	return vi.spyOn(interactions.getPoemComments, 'query').mockImplementation((requestedPoemId) => ({
		queryKey: interactionsKeys.commentsByPoem(requestedPoemId),
		queryFn: () => Promise.resolve(commentPage(comments)),
	}));
}

export function makePoemCommentsScenario() {
	registerPoemsCachePort({
		getPoemKey: (id) => ['poem', id],
	});

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
		withComments(comments: PoemCommentType[] = [rootComment]) {
			scenario.mocks.commentsQuery = mockCommentsQuery(comments);
			return scenario;
		},
		withReplies(replies: PoemCommentType[] = [replyComment]) {
			scenario.mocks.commentsQuery = mockCommentsQuery(replies);
			return scenario;
		},
		withCachedRootComments(comments: PoemCommentType[] = [rootComment]) {
			seedRootComments(queryClient, comments);
			return scenario;
		},
		withCreateCommentSuccess() {
			scenario.mocks.createComment = vi
				.spyOn(interactions.commentPoem, 'mutate')
				.mockResolvedValue();
			return scenario;
		},
		withDeleteCommentFailure(message = 'delete failed') {
			scenario.mocks.deleteComment = vi
				.spyOn(interactions.deleteComment, 'mutate')
				.mockRejectedValue(new Error(message));
			return scenario;
		},
		watchingCommentCreatedEvents() {
			scenario.mocks.commentCreatedEvent = vi.spyOn(eventBus, 'publish').mockResolvedValue();
			return scenario;
		},
		render(options: { enabled?: boolean } = {}) {
			return renderHook(() => usePoemComments(poemId, options), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		renderDisabled() {
			return scenario.render({ enabled: false });
		},
		getCachedRootComments() {
			return queryClient.getQueryData<InfiniteComments>(
				interactionsKeys.commentsByPoem(String(poemId), {
					authScope: 'user:123:active',
				}),
			);
		},
	};

	return scenario;
}
