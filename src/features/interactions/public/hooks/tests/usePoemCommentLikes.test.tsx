// @vitest-environment happy-dom
import { interactions } from '@Api/interactions/endpoints';
import { interactionsKeys } from '@Api/interactions/keys';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { commentPage, otherRootComment, replyComment, rootComment } from './fixtures';
import { makePoemCommentsScenario } from './makePoemCommentsScenario';

describe('FEATURE HOOK - Interactions - comment likes', () => {
	beforeEach(() => vi.restoreAllMocks());
	afterEach(() => vi.restoreAllMocks());

	it('likes a root comment once and updates its optimistic state', async () => {
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([rootComment])
			.withCachedRootComments()
			.withLikeCommentSuccess();
		const { result } = scenario.render();

		await act(() => result.current.likeComment({ id: rootComment.id }));

		expect(scenario.mocks.likeComment).toHaveBeenCalledWith(String(rootComment.id));
		expect(scenario.getCachedRootComments()?.pages[0]?.comments[0]).toMatchObject({
			likesCount: 1,
			likedByCurrentUser: true,
		});
	});

	it('tracks the pending comment and ignores duplicate clicks before the request settles', async () => {
		let resolveLike: () => void = () => undefined;
		const likeMock = vi.spyOn(interactions.likeComment, 'mutate').mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveLike = () => resolve(undefined);
				}),
		);
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([rootComment])
			.withCachedRootComments();
		const { result } = scenario.render();
		await waitFor(() => expect(result.current.comments).toHaveLength(1));
		let firstRequest!: Promise<void>;
		act(() => {
			firstRequest = result.current.likeComment({ id: rootComment.id });
		});
		await waitFor(() =>
			expect(result.current.updatingLikeCommentIds.has(rootComment.id)).toBe(true),
		);

		await act(() => result.current.likeComment({ id: rootComment.id }));
		expect(likeMock).toHaveBeenCalledTimes(1);
		expect(scenario.getCachedRootComments()?.pages[0]?.comments[0]).toMatchObject({
			likesCount: 1,
			likedByCurrentUser: true,
		});
		resolveLike();
		await firstRequest;
		await waitFor(() =>
			expect(result.current.updatingLikeCommentIds.has(rootComment.id)).toBe(false),
		);
	});

	it('unlikes a reply without changing its parent comment', async () => {
		const likedRoot = { ...rootComment, likesCount: 3, likedByCurrentUser: true };
		const likedReply = { ...replyComment, likesCount: 2, likedByCurrentUser: true };
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([likedRoot])
			.withCachedRootComments([likedRoot])
			.seedReplies(rootComment.id, [likedReply])
			.withUnlikeCommentSuccess();
		const { result } = scenario.render();

		await act(() =>
			result.current.unlikeComment({ id: replyComment.id, parentId: rootComment.id }),
		);

		expect(scenario.getCachedRootComments()?.pages[0]?.comments[0]).toMatchObject({
			likesCount: 3,
			likedByCurrentUser: true,
		});
		expect(scenario.getCachedReplies(rootComment.id)?.comments[0]).toMatchObject({
			likesCount: 1,
			likedByCurrentUser: false,
		});
	});

	it('rolls back only the failed comment when different like requests overlap', async () => {
		let rejectFirst: (error: Error) => void = () => undefined;
		let resolveSecond: () => void = () => undefined;
		const likeMock = vi.spyOn(interactions.likeComment, 'mutate').mockImplementation((id) =>
			id === String(rootComment.id)
				? new Promise((_, reject) => {
						rejectFirst = reject;
					})
				: new Promise((resolve) => {
						resolveSecond = () => resolve(undefined);
					}),
		);
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([rootComment, otherRootComment])
			.withCachedRootComments([rootComment, otherRootComment]);
		const { result } = scenario.render();
		await waitFor(() => expect(result.current.comments).toHaveLength(2));
		let firstRequest!: Promise<void>;
		let secondRequest!: Promise<void>;
		act(() => {
			firstRequest = result.current.likeComment({ id: rootComment.id });
			secondRequest = result.current.likeComment({ id: otherRootComment.id });
		});

		await waitFor(() => {
			expect(scenario.getCachedRootComments()?.pages[0]?.comments).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: rootComment.id, likesCount: 1, likedByCurrentUser: true }),
					expect.objectContaining({
						id: otherRootComment.id,
						likesCount: 1,
						likedByCurrentUser: true,
					}),
				]),
			);
		});
		rejectFirst(new Error('first like failed'));
		await expect(firstRequest).rejects.toThrow('first like failed');
		await waitFor(() => {
			const comments = scenario.getCachedRootComments()?.pages[0]?.comments;
			expect(comments?.find((comment) => comment.id === rootComment.id)).toMatchObject({
				likesCount: 0,
				likedByCurrentUser: false,
			});
			expect(comments?.find((comment) => comment.id === otherRootComment.id)).toMatchObject({
				likesCount: 1,
				likedByCurrentUser: true,
			});
		});
		resolveSecond();
		await secondRequest;
		expect(likeMock).toHaveBeenCalledTimes(2);
	});

	it('defers 409 reconciliation until other optimistic likes for the poem settle', async () => {
		let resolveSecond: () => void = () => undefined;
		const serverComments = [
			{ ...rootComment, likesCount: 1, likedByCurrentUser: true },
			{ ...otherRootComment, likesCount: 1, likedByCurrentUser: true },
		];
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([rootComment, otherRootComment])
			.withCachedRootComments([rootComment, otherRootComment]);
		let queryCalls = 0;
		vi.spyOn(interactions.getPoemComments, 'query').mockImplementation((requestedPoemId) => ({
			queryKey: interactionsKeys.commentsByPoem(requestedPoemId),
			queryFn: () =>
				Promise.resolve(
					commentPage(queryCalls++ === 0 ? [rootComment, otherRootComment] : serverComments),
				),
		}));
		const likeMock = vi.spyOn(interactions.likeComment, 'mutate').mockImplementation((id) =>
			id === String(rootComment.id)
				? Promise.reject({ statusCode: 409 })
				: new Promise((resolve) => {
						resolveSecond = () => resolve(undefined);
					}),
		);
		const { result } = scenario.render();
		await waitFor(() => expect(result.current.comments).toHaveLength(2));
		let conflictingRequest!: Promise<void>;
		let pendingRequest!: Promise<void>;
		act(() => {
			conflictingRequest = result.current.likeComment({ id: rootComment.id });
			pendingRequest = result.current.likeComment({ id: otherRootComment.id });
		});
		await expect(conflictingRequest).rejects.toMatchObject({ statusCode: 409 });
		expect(queryCalls).toBe(1);
		expect(scenario.getCachedRootComments()?.pages[0]?.comments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: rootComment.id, likesCount: 1, likedByCurrentUser: true }),
				expect.objectContaining({
					id: otherRootComment.id,
					likesCount: 1,
					likedByCurrentUser: true,
				}),
			]),
		);

		resolveSecond();
		await pendingRequest;
		await waitFor(() => expect(queryCalls).toBeGreaterThan(1));
		expect(likeMock).toHaveBeenCalledTimes(2);
		expect(result.current.comments).toEqual(serverComments);
	});

	it('reconciles a 409 response from the server instead of keeping stale optimistic state', async () => {
		const serverComment = { ...rootComment, likesCount: 1, likedByCurrentUser: true };
		const scenario = makePoemCommentsScenario()
			.asAuthenticatedUser()
			.withComments([rootComment])
			.withCachedRootComments()
			.withLikeCommentFailure({ statusCode: 409 });
		let queryCalls = 0;
		vi.spyOn(interactions.getPoemComments, 'query').mockImplementation((requestedPoemId) => ({
			queryKey: interactionsKeys.commentsByPoem(requestedPoemId),
			queryFn: () =>
				Promise.resolve(commentPage(queryCalls++ === 0 ? [rootComment] : [serverComment])),
		}));
		const { result } = scenario.render();
		await waitFor(() => expect(result.current.comments).toHaveLength(1));

		await expect(
			act(() => result.current.likeComment({ id: rootComment.id })),
		).rejects.toMatchObject({ statusCode: 409 });
		await waitFor(() =>
			expect(result.current.comments[0]).toMatchObject({
				likesCount: 1,
				likedByCurrentUser: true,
			}),
		);
		expect(queryCalls).toBeGreaterThan(1);
	});
});
