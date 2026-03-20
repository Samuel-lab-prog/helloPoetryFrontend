import { Avatar, Box, Flex, IconButton, Text, Textarea } from '@chakra-ui/react';
import { memo, useState } from 'react';
import {
	ChevronDown,
	ChevronUp,
	Heart,
	MessageCircleReply,
	SendHorizontal,
	Trash2,
} from 'lucide-react';
import { type PoemCommentType } from '@features/interactions';
import { findForbiddenWords, formatRelativeTime } from '@root/core/base';

interface CommentThreadProps {
	/**
	 * Comment item to render, including author and counts for likes/replies.
	 */
	comment: PoemCommentType;
	/**
	 * The authenticated client id, used to decide when the delete action is shown.
	 */
	authClientId: number;
	/**
	 * Whether the current poem allows new comments/replies.
	 */
	poemIsCommentable: boolean;
	/**
	 * Whether the user is authenticated (enables reply/like/delete actions).
	 */
	isAuthenticated: boolean;
	/**
	 * Loading state for creating a new reply.
	 */
	isCreatingComment: boolean;
	/**
	 * Loading state for deleting a comment.
	 */
	isDeletingComment: boolean;
	/**
	 * Creates a new comment or reply.
	 */
	createComment: (args: { content: string; parentId?: number }) => Promise<void>;
	/**
	 * Deletes a comment by id (optionally scoped to a parent comment).
	 */
	deleteComment: (args: { id: number; parentId?: number }) => Promise<void>;
	/**
	 * Adds a like to a comment.
	 */
	likeComment: (args: { id: number; parentId?: number }) => Promise<void>;
	/**
	 * Removes a like from a comment.
	 */
	unlikeComment: (args: { id: number; parentId?: number }) => Promise<void>;
	/**
	 * Loading state for like/unlike mutation.
	 */
	isUpdatingCommentLike: boolean;
	/**
	 * Fetches replies for a parent comment, optionally forcing a refresh.
	 */
	fetchReplies: (parentId: number, options?: { force?: boolean }) => Promise<PoemCommentType[]>;
	/**
	 * Cached replies keyed by parent comment id.
	 */
	repliesByCommentId: Record<number, PoemCommentType[]>;
	/**
	 * Setter for cached replies keyed by parent comment id.
	 */
	setRepliesByCommentId: React.Dispatch<React.SetStateAction<Record<number, PoemCommentType[]>>>;
}

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

	async function handleToggleReplies() {
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
	}

	async function handleCreateReply() {
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
	}

	async function handleDelete() {
		await deleteComment({ id: comment.id, parentId: comment.parentId ?? undefined });
		if (comment.parentId) {
			const parentReplies = await fetchReplies(comment.parentId, { force: true });
			setRepliesByCommentId((prev) => ({
				...prev,
				[comment.parentId!]: parentReplies,
			}));
		}
	}

	return (
		<Box
			p={3}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='md'
			bg='rgba(255,255,255,0.02)'
			ml={0}
		>
			<Flex justify='space-between' align='start' gap={3}>
				<Box flex='1'>
					<Flex align='center' gap={2} mb={2}>
						<Avatar.Root size='xs'>
							<Avatar.Image src={comment.author.avatarUrl ?? undefined} />
							<Avatar.Fallback name={comment.author.nickname} />
						</Avatar.Root>
						<Box>
							<Text textStyle='smaller' color='pink.200'>
								@{comment.author.nickname}
							</Text>
							<Text textStyle='smaller' color='pink.200'>
								{formatRelativeTime(comment.createdAt)}
							</Text>
						</Box>
					</Flex>
					<Text textStyle='small'>{comment.content}</Text>
				</Box>
				{comment.author.id === authClientId && (
					<IconButton
						size='xs'
						variant='solidPink'
						colorPalette='gray'
						aria-label='Delete comment'
						title='Delete comment'
						loading={isDeletingComment}
						onClick={handleDelete}
					>
						<Trash2 />
					</IconButton>
				)}
			</Flex>

			<Flex mt={3} justify='space-between' align='center' gap={2} wrap='wrap'>
				<Flex align='center' gap={2}>
					<IconButton
						size='xs'
						variant='solidPink'
						colorPalette='gray'
						aria-label={activeReplyFor === comment.id ? 'Close reply' : 'Reply to comment'}
						title={activeReplyFor === comment.id ? 'Close reply' : 'Reply to comment'}
						disabled={!isAuthenticated}
						onClick={handleToggleReplies}
					>
						<MessageCircleReply />
					</IconButton>
					<IconButton
						size='xs'
						variant='solidPink'
						colorPalette='gray'
						aria-label={comment.likedByCurrentUser ? 'Unlike comment' : 'Like comment'}
						title={comment.likedByCurrentUser ? 'Unlike comment' : 'Like comment'}
						disabled={!isAuthenticated}
						loading={isUpdatingCommentLike}
						onClick={() =>
							comment.likedByCurrentUser
								? unlikeComment({ id: comment.id, parentId: comment.parentId ?? undefined })
								: likeComment({ id: comment.id, parentId: comment.parentId ?? undefined })
						}
					>
						<Heart />
					</IconButton>
					<Text textStyle='smaller' color='pink.200'>
						{comment.likesCount}
					</Text>
				</Flex>
				{hasReplies && (
					<Flex align='center' gap={2}>
						<Text textStyle='smaller' color='pink.200'>
							{comment.aggregateChildrenCount} repl
							{comment.aggregateChildrenCount === 1 ? 'y' : 'ies'}
						</Text>
						{!hasLoadedReplies && (
							<IconButton
								size='xs'
								variant='solidPink'
								colorPalette='gray'
								aria-label='View replies'
								title='View replies'
								onClick={handleToggleReplies}
							>
								{activeReplyFor === comment.id ? <ChevronUp /> : <ChevronDown />}
							</IconButton>
						)}
					</Flex>
				)}
			</Flex>

			{hasLoadedReplies && (
				<Box mt={3} pl={4} borderLeft='1px solid' borderColor='purple.700'>
					<Flex direction='column' gap={2}>
						{replies.map((reply) => (
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
						))}
					</Flex>
				</Box>
			)}

			{activeReplyFor === comment.id && (
				<Box mt={3} pl={4} borderLeft='1px solid' borderColor='purple.700'>
					<Flex direction='column' gap={2}>
						<Textarea
							value={replyInput}
							onChange={(e) => setReplyInput(e.target.value)}
							placeholder='Reply to comment'
							rows={3}
							maxLength={300}
							disabled={!isAuthenticated || !poemIsCommentable || isCreatingComment}
						/>
						<Flex justify='flex-end'>
							<IconButton
								size='sm'
								variant='solidPink'
								aria-label='Send reply'
								title='Send reply'
								disabled={
									!isAuthenticated || !replyInput.trim() || !poemIsCommentable || isCreatingComment
								}
								loading={isCreatingComment}
								onClick={handleCreateReply}
							>
								<SendHorizontal />
							</IconButton>
						</Flex>
						{replyError && (
							<Text textStyle='smaller' color='red.400'>
								{replyError}
							</Text>
						)}
					</Flex>
				</Box>
			)}
		</Box>
	);
});
