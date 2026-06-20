// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { poemId, replyComment, rootComment } from './fixtures';
import { makePoemCommentsScenario } from './makePoemCommentsScenario';

describe('FEATURE HOOK - Interactions - usePoemComments', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does not request comments or replies when disabled', async () => {
		const scenario = makePoemCommentsScenario()
			.asLoggedOutVisitor()
			.withComments();

		const { result } = scenario.renderDisabled();

		await expect(result.current.fetchReplies(rootComment.id)).resolves.toEqual([]);

		expect(result.current.comments).toEqual([]);
		expect(result.current.isLoadingComments).toBe(false);
		expect(scenario.mocks.commentsQuery).not.toHaveBeenCalled();
	});

	it('loads root comments when enabled', async () => {
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments();

		const { result } = scenario.render();

		await waitFor(() => expect(result.current.comments).toHaveLength(1));

		expect(result.current.comments[0]?.content).toBe('A visible comment');
		expect(scenario.mocks.commentsQuery).toHaveBeenCalledWith(String(poemId), {
			limit: 30,
			cursor: undefined,
		});
	});

	it('fetches replies through the parent comment query key', async () => {
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withReplies();

		const { result } = scenario.render();

		await expect(result.current.fetchReplies(rootComment.id)).resolves.toEqual([replyComment]);
		expect(scenario.mocks.commentsQuery).toHaveBeenCalledWith(String(poemId), {
			parentId: String(rootComment.id),
			limit: 30,
		});
	});

	it('creates a comment and publishes the commentCreated event', async () => {
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([])
			.withCreateCommentSuccess()
			.watchingCommentCreatedEvents();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.createComment({
				content: 'New reply',
				parentId: rootComment.id,
			});
		});

		expect(scenario.mocks.createComment).toHaveBeenCalledWith({
			poemId,
			content: 'New reply',
			parentId: rootComment.id,
		});
		expect(scenario.mocks.commentCreatedEvent).toHaveBeenCalledWith(
			'commentCreated',
			expect.objectContaining({
				poemId,
				parentId: rootComment.id,
			}),
		);
	});

	it('restores comment cache when deleting a comment fails', async () => {
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([rootComment])
			.withCachedRootComments()
			.withDeleteCommentFailure();

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.deleteComment({ id: rootComment.id });
			}),
		).rejects.toThrow('delete failed');

		const cache = scenario.getCachedRootComments();
		expect(cache?.pages[0]?.comments).toEqual([rootComment]);
	});
});
