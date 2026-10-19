import { Box } from '@chakra-ui/react';
import { type PoemCommentType, usePoemCommentReplies } from '@features/interactions/public';
import { findForbiddenWords } from '@Utils';
import { memo, useCallback, useState } from 'react';

import { CommentThreadActions } from './CommentThreadActions';
import { CommentThreadHeader } from './CommentThreadHeader';
import { CommentThreadReplies } from './CommentThreadReplies';
import { CommentThreadReplyComposer } from './CommentThreadReplyComposer';
import { type CommentThreadProps } from './types';

/**
 * Renders a single comment with actions (reply, like, delete) and nested replies.
 *
 * This component is recursive: when replies are loaded, it renders a new
 * `CommentThread` for each reply. It also handles reply creation, validation,
 * and optimistic UI state for loading and errors.
 */
export const CommentThread = memo(function CommentThread({
	comment,
	poemId,
	authScope,
	parentAuthorId,
	parentAuthorNickname,
	parentAuthorUnavailable,
	hideTopBorder,
	authClientId,
	poemIsCommentable,
	isAuthenticated,
	isCreatingComment,
	isDeletingComment,
	createComment,
	deleteComment,
	likeComment,
	unlikeComment,
	updatingLikeCommentIds,
	fetchReplies,
}: CommentThreadProps) {
	const [isReplyComposerOpen, setIsReplyComposerOpen] = useState(false);
	const [areRepliesOpen, setAreRepliesOpen] = useState(false);
	const [replyInput, setReplyInput] = useState('');
	const [replyError, setReplyError] = useState('');

	const { replies, hasLoadedReplies, isLoadingReplies } = usePoemCommentReplies(
		poemId,
		authScope,
		comment.id,
	);
	const hasReplies = comment.aggregateChildrenCount > 0;
	const canReplyToComment = comment.author.isUnavailable !== true;
	const isLikePending = updatingLikeCommentIds.has(comment.id);

	const handleToggleReplyComposer = useCallback(() => {
		if (!canReplyToComment) return;
		if (!isAuthenticated) {
			setReplyError('Sign in to reply.');
			return;
		}
		setIsReplyComposerOpen((prev) => {
			const next = !prev;
			if (!next) {
				setReplyInput('');
				setReplyError('');
			}
			return next;
		});
	}, [canReplyToComment, isAuthenticated]);

	const handleToggleRepliesView = useCallback(async () => {
		setAreRepliesOpen((prev) => !prev);
		if (!areRepliesOpen && !hasLoadedReplies && hasReplies) {
			try {
				await fetchReplies(comment.id);
			} catch {
				setReplyError('Error loading replies.');
			}
		}
	}, [areRepliesOpen, comment.id, fetchReplies, hasReplies, hasLoadedReplies]);

	const handlePrefetchReplies = useCallback(() => {
		if (!hasReplies) return;
		if (hasLoadedReplies) return;
		void fetchReplies(comment.id);
	}, [comment.id, fetchReplies, hasLoadedReplies, hasReplies]);

	const handleCreateReply = useCallback(async () => {
		if (!replyInput.trim()) return;
		if (!isAuthenticated) {
			setReplyError('Sign in to reply.');
			return;
		}
		const forbiddenWordsFound = findForbiddenWords(replyInput);
		if (forbiddenWordsFound.length > 0) {
			setReplyError(`Remove forbidden words: ${forbiddenWordsFound.join(', ')}`);
			return;
		}

		try {
			await createComment({ content: replyInput.trim(), parentId: comment.id });
			setReplyInput('');
			setReplyError('');
			setAreRepliesOpen(true);
			await fetchReplies(comment.id, { force: true });
		} catch {
			setReplyError('Error sending reply.');
		}
	}, [comment.id, createComment, fetchReplies, isAuthenticated, replyInput]);

	const handleDelete = useCallback(async () => {
		await deleteComment({ id: comment.id, parentId: comment.parentId ?? undefined });
		if (comment.parentId) {
			await fetchReplies(comment.parentId, { force: true });
		}
	}, [comment.id, comment.parentId, deleteComment, fetchReplies]);

	const handleToggleLike = useCallback(async () => {
		if (!isAuthenticated || !canReplyToComment || isLikePending) return;
		try {
			const args = { id: comment.id, parentId: comment.parentId ?? undefined };
			if (comment.likedByCurrentUser) {
				await unlikeComment(args);
				return;
			}
			await likeComment(args);
		} catch {
			// The hook exposes the shared error message for the page-level toast.
		}
	}, [
		canReplyToComment,
		comment.id,
		comment.likedByCurrentUser,
		comment.parentId,
		isAuthenticated,
		isLikePending,
		likeComment,
		unlikeComment,
	]);

	return (
		<Box w='full'>
			<Box
				id={`comment-${comment.id}`}
				py={3}
				borderTop={hideTopBorder ? 'none' : '1px solid'}
				borderColor={hideTopBorder ? 'transparent' : 'purple.700'}
				ml={0}
				w='full'
			>
				<CommentThreadHeader
					comment={comment}
					parentAuthorId={parentAuthorId}
					parentAuthorNickname={parentAuthorNickname}
					parentAuthorUnavailable={parentAuthorUnavailable}
					authClientId={authClientId}
					isDeletingComment={isDeletingComment(comment.id)}
					isAuthenticated={isAuthenticated}
					isReplyComposerOpen={isReplyComposerOpen}
					onDelete={handleDelete}
					onToggleReplyComposer={handleToggleReplyComposer}
				/>

				<CommentThreadActions
					comment={comment}
					areRepliesOpen={areRepliesOpen}
					hasReplies={hasReplies}
					hasLoadedReplies={hasLoadedReplies}
					isLoadingReplies={isLoadingReplies}
					onToggleReplies={handleToggleRepliesView}
					onPrefetchReplies={handlePrefetchReplies}
					isAuthenticated={isAuthenticated}
					isLikePending={isLikePending}
					canLike={canReplyToComment}
					onToggleLike={handleToggleLike}
				/>

				{isReplyComposerOpen && (
					<CommentThreadReplyComposer
						replyInput={replyInput}
						replyError={replyError}
						isAuthenticated={isAuthenticated}
						poemIsCommentable={poemIsCommentable}
						isCreatingComment={isCreatingComment}
						onChange={setReplyInput}
						onSubmit={handleCreateReply}
					/>
				)}
			</Box>

			{areRepliesOpen && hasLoadedReplies && (
				<CommentThreadReplies
					replies={replies}
					renderReply={(reply: PoemCommentType, index: number) => (
						<CommentThread
							key={reply.id}
							comment={reply}
							poemId={poemId}
							authScope={authScope}
							parentAuthorId={comment.author.id}
							parentAuthorNickname={comment.author.nickname}
							parentAuthorUnavailable={comment.author.isUnavailable}
							hideTopBorder={index === 0}
							authClientId={authClientId}
							poemIsCommentable={poemIsCommentable}
							isAuthenticated={isAuthenticated}
							isCreatingComment={isCreatingComment}
							isDeletingComment={isDeletingComment}
							createComment={createComment}
							deleteComment={deleteComment}
							likeComment={likeComment}
							unlikeComment={unlikeComment}
							updatingLikeCommentIds={updatingLikeCommentIds}
							fetchReplies={fetchReplies}
						/>
					)}
				/>
			)}
		</Box>
	);
});
