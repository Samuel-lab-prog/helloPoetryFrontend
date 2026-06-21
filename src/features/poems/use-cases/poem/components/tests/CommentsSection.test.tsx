// @vitest-environment happy-dom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authClientId, replyComment, rootComment } from './fixtures';
import { makeCommentsSectionScenario } from './makeCommentsSectionScenario';

describe('FEATURE COMPONENT - Poems - CommentsSection', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('renders a clear read-only state when comments are restricted', () => {
		makeCommentsSectionScenario()
			.withRestrictionMessage('Your account cannot view comments right now.')
			.render();

		expect(screen.getByText('Comments restricted')).toBeTruthy();
		expect(screen.getByText('Comments are unavailable right now')).toBeTruthy();
		expect(screen.getByText('Your account cannot view comments right now.')).toBeTruthy();
		expect(screen.queryByPlaceholderText('Write a comment (1-3000 characters)')).toBeNull();
		expect(screen.queryByLabelText('Send comment')).toBeNull();
	});

	it('keeps the composer disabled and explains the state for logged-out visitors', () => {
		makeCommentsSectionScenario().asLoggedOutVisitor().render();

		const input = screen.getByPlaceholderText(
			'Write a comment (1-3000 characters)',
		) as HTMLTextAreaElement;
		const sendButton = screen.getByLabelText('Send comment') as HTMLButtonElement;

		expect(input.disabled).toBe(true);
		expect(sendButton.disabled).toBe(true);
		expect(screen.getByText('Sign in to comment.')).toBeTruthy();
		expect(screen.getByText('Sign in to see the comments.')).toBeTruthy();
	});

	it('publishes a comment when an authenticated user submits valid input', async () => {
		const scenario = makeCommentsSectionScenario().withCommentInput('A new comment');
		scenario.render();

		fireEvent.click(screen.getByLabelText('Send comment'));

		await waitFor(() => expect(scenario.mocks.onPublishComment).toHaveBeenCalledTimes(1));
	});

	it('keeps the composer disabled when the poem does not allow comments', () => {
		makeCommentsSectionScenario()
			.withCommentsDisabled()
			.withCommentInput('Cannot publish this')
			.render();

		const input = screen.getByPlaceholderText(
			'Write a comment (1-3000 characters)',
		) as HTMLTextAreaElement;
		const sendButton = screen.getByLabelText('Send comment') as HTMLButtonElement;

		expect(input.disabled).toBe(true);
		expect(sendButton.disabled).toBe(true);
		expect(screen.getByText('Comments are disabled for this poem.')).toBeTruthy();
	});

	it('shows the comment validation error near the composer', () => {
		makeCommentsSectionScenario()
			.withCommentInput('Invalid comment')
			.withCommentError('Remove forbidden words: forbidden')
			.render();

		expect(screen.getByText('Remove forbidden words: forbidden')).toBeTruthy();
	});

	it('prefetches replies for the first visible comments that have children', async () => {
		const scenario = makeCommentsSectionScenario().withComments([rootComment]);
		scenario.render();

		await waitFor(() =>
			expect(scenario.mocks.prefetchReplies).toHaveBeenCalledWith(rootComment.id),
		);
	});

	it('loads replies when the user opens a comment thread', async () => {
		const scenario = makeCommentsSectionScenario()
			.withComments([rootComment])
			.withFetchReplies([replyComment]);
		scenario.render();

		fireEvent.click(screen.getByLabelText('View replies'));

		await waitFor(() => expect(scenario.mocks.fetchReplies).toHaveBeenCalledWith(rootComment.id));
		expect(await screen.findByText('A visible reply')).toBeTruthy();
	});

	it('deletes the authenticated user comment through the comment action', async () => {
		const scenario = makeCommentsSectionScenario().withComments([
			{
				...rootComment,
				author: {
					...rootComment.author,
					id: authClientId,
				},
			},
		]);
		scenario.render();

		fireEvent.click(screen.getByLabelText('Delete comment'));

		await waitFor(() =>
			expect(scenario.mocks.deleteComment).toHaveBeenCalledWith({
				id: rootComment.id,
				parentId: undefined,
			}),
		);
	});

	it('loads the next comments page from the footer action', async () => {
		const scenario = makeCommentsSectionScenario()
			.withComments([rootComment])
			.withLoadMoreComments();
		scenario.render();

		fireEvent.click(screen.getByText('Load more comments'));

		await waitFor(() => expect(scenario.mocks.onLoadMoreComments).toHaveBeenCalledTimes(1));
	});

	it('shows the comments error message with a refresh action', () => {
		makeCommentsSectionScenario().withCommentsError('Comments failed to load.').render();

		expect(screen.getByRole('alert')).toBeTruthy();
		expect(screen.getByText('COMMENTS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('Comments failed to load.')).toBeTruthy();
		expect(screen.getByText('Refresh comments')).toBeTruthy();
	});
});
