import { memo, useMemo, type Dispatch, type SetStateAction } from 'react';
import { Box, Button, Flex, Heading, Text, Textarea } from '@chakra-ui/react';
import { AsyncState } from '@root/core/base';
import { CommentThread } from '../CommentThread';
import type { PoemCommentType } from '@features/interactions';

type CommentsSectionProps = {
	poemIsCommentable: boolean;
	isAuthenticated: boolean;
	commentInput: string;
	commentError: string;
	authClientId: number;
	comments: PoemCommentType[];
	isLoadingComments: boolean;
	isCommentsError: boolean;
	isCreatingComment: boolean;
	isDeletingComment: boolean;
	isUpdatingCommentLike: boolean;
	repliesByCommentId: Record<number, PoemCommentType[]>;
	setRepliesByCommentId: Dispatch<SetStateAction<Record<number, PoemCommentType[]>>>;
	onCommentInputChange: (value: string) => void;
	onPublishComment: () => Promise<void>;
	createComment: (args: { content: string; parentId?: number }) => Promise<void>;
	deleteComment: (args: { id: number; parentId?: number }) => Promise<void>;
	likeComment: (args: { id: number; parentId?: number }) => Promise<void>;
	unlikeComment: (args: { id: number; parentId?: number }) => Promise<void>;
	fetchReplies: (parentId: number, options?: { force?: boolean }) => Promise<PoemCommentType[]>;
};

export const CommentsSection = memo(function CommentsSection({
	poemIsCommentable,
	isAuthenticated,
	commentInput,
	commentError,
	authClientId,
	comments,
	isLoadingComments,
	isCommentsError,
	isCreatingComment,
	isDeletingComment,
	isUpdatingCommentLike,
	repliesByCommentId,
	setRepliesByCommentId,
	onCommentInputChange,
	onPublishComment,
	createComment,
	deleteComment,
	likeComment,
	unlikeComment,
	fetchReplies,
}: CommentsSectionProps) {
	const canPublishComment =
		isAuthenticated && poemIsCommentable && commentInput.trim().length > 0 && !isCreatingComment;

	const renderedThreads = useMemo(
		() =>
			comments.map((comment) => (
				<CommentThread
					key={comment.id}
					comment={comment}
					authClientId={authClientId}
					poemIsCommentable={poemIsCommentable}
					isAuthenticated={isAuthenticated}
					isCreatingComment={isCreatingComment}
					isDeletingComment={isDeletingComment}
					createComment={createComment}
					deleteComment={deleteComment}
					likeComment={likeComment}
					unlikeComment={unlikeComment}
					isUpdatingCommentLike={isUpdatingCommentLike}
					fetchReplies={fetchReplies}
					repliesByCommentId={repliesByCommentId}
					setRepliesByCommentId={setRepliesByCommentId}
				/>
			)),
		[
			authClientId,
			comments,
			createComment,
			deleteComment,
			fetchReplies,
			isAuthenticated,
			isCreatingComment,
			isDeletingComment,
			isUpdatingCommentLike,
			likeComment,
			poemIsCommentable,
			repliesByCommentId,
			setRepliesByCommentId,
			unlikeComment,
		],
	);

	return (
		<Box
			mt={10}
			p={[4, 6]}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.03)'
		>
			<Heading as='h2' textStyle='h3' mb={4}>
				Comments
			</Heading>

			<Flex direction='column' gap={3} mb={6}>
				<Textarea
					value={commentInput}
					onChange={(e) => onCommentInputChange(e.target.value)}
					placeholder='Write a comment (1-300 characters)'
					rows={4}
					maxLength={300}
					borderColor={commentError ? 'red.400' : undefined}
					_focusVisible={commentError ? { borderColor: 'red.400' } : undefined}
					disabled={!isAuthenticated || !poemIsCommentable || isCreatingComment}
				/>
				<Flex
					align={{ base: 'stretch', md: 'center' }}
					justify='space-between'
					direction={{ base: 'column', md: 'row' }}
					gap={2}
				>
					<Text textStyle='smaller' color='pink.200'>
						{commentInput.length}/300
					</Text>
					<Button
						variant='solidPink'
						w={{ base: 'full', md: 'auto' }}
						disabled={!canPublishComment}
						loading={isCreatingComment}
						onClick={() => {
							void onPublishComment();
						}}
					>
						Publish comment
					</Button>
				</Flex>
				{!poemIsCommentable && (
					<Text textStyle='small' color='pink.200'>
						Comments are disabled for this poem.
					</Text>
				)}
				{!isAuthenticated && (
					<Text textStyle='small' color='pink.200'>
						Sign in to comment.
					</Text>
				)}
				{commentError && (
					<Text textStyle='small' color='red.400'>
						{commentError}
					</Text>
				)}
			</Flex>

			<AsyncState
				isLoading={isLoadingComments}
				isError={isCommentsError}
				isEmpty={comments.length === 0}
				loadingElement={<Text textStyle='body'>Loading comments...</Text>}
				errorElement={<Text textStyle='body'>Error loading comments.</Text>}
				emptyElement={
					!isAuthenticated ? (
						<Text textStyle='body'>Sign in to see the comments.</Text>
					) : (
						<Text textStyle='body'>Be the first to comment.</Text>
					)
				}
			>
				<Flex direction='column' gap={3}>
					{renderedThreads}
				</Flex>
			</AsyncState>
		</Box>
	);
});
