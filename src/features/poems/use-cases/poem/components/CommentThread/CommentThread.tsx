import { Box } from '@chakra-ui/react';
import { memo, useCallback, useState } from 'react';
import { type PoemCommentType } from '@features/interactions';
import { findForbiddenWords } from '@BaseComponents';
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
	parentAuthorId,
	parentAuthorNickname,
	hideTopBorder,
	authClientId,
	poemIsCommentable,
	isAuthenticated,
	isCreatingComment,
	isDeletingComment,
	createComment,
	deleteComment,
	fetchReplies,
	repliesByCommentId,
	setRepliesByCommentId,
}: CommentThreadProps) {
	const [isReplyComposerOpen, setIsReplyComposerOpen] = useState(false);
	const [areRepliesOpen, setAreRepliesOpen] = useState(false);
	const [replyInput, setReplyInput] = useState('');
	const [replyError, setReplyError] = useState('');

	const replies = repliesByCommentId[comment.id] ?? [];
	const hasReplies = comment.aggregateChildrenCount > 0;
	const hasLoadedReplies = replies.length > 0;

	const handleToggleReplyComposer = useCallback(() => {
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
	}, [isAuthenticated]);

	const handleToggleRepliesView = useCallback(async () => {
		setAreRepliesOpen((prev) => !prev);
		if (!areRepliesOpen && !repliesByCommentId[comment.id] && hasReplies) {
			try {
				const fetched = await fetchReplies(comment.id);
				setRepliesByCommentId((prev) => ({ ...prev, [comment.id]: fetched }));
			} catch {
				setReplyError('Error loading replies.');
			}
		}
	}, [
		areRepliesOpen,
		comment.id,
		fetchReplies,
		hasReplies,
		repliesByCommentId,
		setRepliesByCommentId,
	]);

	const handlePrefetchReplies = useCallback(() => {
		if (!hasReplies) return;
		if (repliesByCommentId[comment.id]) return;
		void fetchReplies(comment.id);
	}, [comment.id, fetchReplies, hasReplies, repliesByCommentId]);

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

	// TODO: Re-enable comment like handler when UI for likes returns.

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
					authClientId={authClientId}
					isDeletingComment={isDeletingComment}
					onDelete={handleDelete}
				/>

				<CommentThreadActions
					comment={comment}
					isReplyComposerOpen={isReplyComposerOpen}
					areRepliesOpen={areRepliesOpen}
					isAuthenticated={isAuthenticated}
					hasReplies={hasReplies}
					hasLoadedReplies={hasLoadedReplies}
					onToggleReplies={handleToggleRepliesView}
					onToggleReplyComposer={handleToggleReplyComposer}
					onPrefetchReplies={handlePrefetchReplies}
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
							parentAuthorId={comment.author.id}
							parentAuthorNickname={comment.author.nickname}
							hideTopBorder={index === 0}
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
						/>
					)}
				/>
			)}
		</Box>
	);
});
