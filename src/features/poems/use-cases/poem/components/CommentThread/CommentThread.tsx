import { Box } from '@chakra-ui/react';
import { memo, useCallback, useState } from 'react';
import { type PoemCommentType } from '@features/interactions';
import { findForbiddenWords } from '@root/core/base';
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
	authClientId,
	poemIsCommentable,
	isAuthenticated,
	isCreatingComment,
	isDeletingComment,
	createComment,
	deleteComment,
	likeComment,
	unlikeComment,
	isUpdatingCommentLike,
	fetchReplies,
	repliesByCommentId,
	setRepliesByCommentId,
}: CommentThreadProps) {
	const [activeReplyFor, setActiveReplyFor] = useState<number | null>(null);
	const [replyInput, setReplyInput] = useState('');
	const [replyError, setReplyError] = useState('');

	const replies = repliesByCommentId[comment.id] ?? [];
	const hasReplies = comment.aggregateChildrenCount > 0;
	const hasLoadedReplies = replies.length > 0;

	const handleToggleReplies = useCallback(async () => {
		if (!isAuthenticated) {
			setReplyError('Sign in to reply.');
			return;
		}
		if (activeReplyFor === comment.id) {
			setActiveReplyFor(null);
			setReplyInput('');
			setReplyError('');
			return;
		}

		setActiveReplyFor(comment.id);
		setReplyError('');
		setReplyInput('');
		if (!repliesByCommentId[comment.id] && hasReplies) {
			try {
				const fetched = await fetchReplies(comment.id);
				setRepliesByCommentId((prev) => ({ ...prev, [comment.id]: fetched }));
			} catch {
				setReplyError('Error loading replies.');
			}
		}
	}, [
		activeReplyFor,
		comment.id,
		hasReplies,
		isAuthenticated,
		fetchReplies,
		repliesByCommentId,
		setRepliesByCommentId,
	]);

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
			const fetched = await fetchReplies(comment.id, { force: true });
			setRepliesByCommentId((prev) => ({ ...prev, [comment.id]: fetched }));
		} catch {
			setReplyError('Error sending reply.');
		}
	}, [comment.id, createComment, fetchReplies, isAuthenticated, replyInput, setRepliesByCommentId]);

	const handleDelete = useCallback(async () => {
		await deleteComment({ id: comment.id, parentId: comment.parentId ?? undefined });
		if (comment.parentId) {
			const parentReplies = await fetchReplies(comment.parentId, { force: true });
			setRepliesByCommentId((prev) => ({
				...prev,
				[comment.parentId!]: parentReplies,
			}));
		}
	}, [comment.id, comment.parentId, deleteComment, fetchReplies, setRepliesByCommentId]);

	const handleToggleLike = useCallback(async () => {
		if (comment.likedByCurrentUser) {
			await unlikeComment({ id: comment.id, parentId: comment.parentId ?? undefined });
			return;
		}
		await likeComment({ id: comment.id, parentId: comment.parentId ?? undefined });
	}, [comment.id, comment.likedByCurrentUser, comment.parentId, likeComment, unlikeComment]);

	return (
		<Box
			p={3}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='md'
			bg='rgba(255,255,255,0.02)'
			ml={0}
		>
			<CommentThreadHeader
				comment={comment}
				authClientId={authClientId}
				isDeletingComment={isDeletingComment}
				onDelete={handleDelete}
			/>

			<CommentThreadActions
				comment={comment}
				activeReplyFor={activeReplyFor}
				isAuthenticated={isAuthenticated}
				isUpdatingCommentLike={isUpdatingCommentLike}
				hasReplies={hasReplies}
				hasLoadedReplies={hasLoadedReplies}
				onToggleReplies={handleToggleReplies}
				onToggleLike={handleToggleLike}
			/>

			{hasLoadedReplies && (
				<CommentThreadReplies
					replies={replies}
					renderReply={(reply: PoemCommentType) => (
						<CommentThread
							key={reply.id}
							comment={reply}
							authClientId={authClientId}
							poemIsCommentable={poemIsCommentable}
							isAuthenticated={isAuthenticated}
							isCreatingComment={isCreatingComment}
							isDeletingComment={isDeletingComment}
							createComment={createComment}
							deleteComment={deleteComment}
							fetchReplies={fetchReplies}
							repliesByCommentId={repliesByCommentId}
							setRepliesByCommentId={setRepliesByCommentId}
							likeComment={likeComment}
							unlikeComment={unlikeComment}
							isUpdatingCommentLike={isUpdatingCommentLike}
						/>
					)}
				/>
			)}

			{activeReplyFor === comment.id && (
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
	);
});
