import { AsyncState } from '@BaseComponents';
import { Box, Button, Flex, Heading, IconButton, Text, Textarea } from '@chakra-ui/react';
import type { PoemCommentType } from '@features/interactions/public';
import { SendHorizontal } from 'lucide-react';
import { type Dispatch, memo, type SetStateAction, useEffect, useMemo, useRef } from 'react';

import { CommentThread } from './CommentThread';

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
	isDeletingComment: (commentId: number) => boolean;
	repliesByCommentId: Record<number, PoemCommentType[]>;
	setRepliesByCommentId: Dispatch<SetStateAction<Record<number, PoemCommentType[]>>>;
	hasMoreComments: boolean;
	isLoadingMoreComments: boolean;
	onLoadMoreComments: () => Promise<unknown>;
	onCommentInputChange: (value: string) => void;
	onPublishComment: () => Promise<void>;
	createComment: (args: { content: string; parentId?: number }) => Promise<void>;
	deleteComment: (args: { id: number; parentId?: number }) => Promise<void>;
	fetchReplies: (parentId: number, options?: { force?: boolean }) => Promise<PoemCommentType[]>;
	prefetchReplies: (parentId: number) => Promise<void>;
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
	repliesByCommentId,
	setRepliesByCommentId,
	hasMoreComments,
	isLoadingMoreComments,
	onLoadMoreComments,
	onCommentInputChange,
	onPublishComment,
	createComment,
	deleteComment,
	fetchReplies,
	prefetchReplies,
}: CommentsSectionProps) {
	const canPublishComment =
		isAuthenticated && poemIsCommentable && commentInput.trim().length > 0 && !isCreatingComment;
	const prefetchedRepliesRef = useRef<Set<number>>(new Set());

	const renderedThreads = useMemo(
		() =>
			comments.map((comment, index) => (
				<CommentThread
					key={comment.id}
					comment={comment}
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
			poemIsCommentable,
			repliesByCommentId,
			setRepliesByCommentId,
		],
	);

	useEffect(() => {
		if (comments.length === 0) return;
		const candidates = comments.filter((comment) => comment.aggregateChildrenCount > 0);
		for (const comment of candidates.slice(0, 3)) {
			if (prefetchedRepliesRef.current.has(comment.id)) continue;
			prefetchedRepliesRef.current.add(comment.id);
			void prefetchReplies(comment.id);
		}
	}, [comments, prefetchReplies]);

	return (
		<Box mt={10}>
			<Heading as='h2' textStyle={{ base: 'h4', md: 'h3' }} mb={4}>
				Comments
			</Heading>

			<Flex direction='column' gap={3} mb={6}>
				<Textarea
					value={commentInput}
					onChange={(e) => onCommentInputChange(e.target.value)}
					placeholder='Write a comment (1-3000 characters)'
					rows={4}
					maxLength={3000}
					textStyle='smaller'
					_placeholder={{ fontSize: 'xs', color: 'fg.muted' }}
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
						{commentInput.length}/3000
					</Text>
					<IconButton
						aria-label='Send comment'
						title='Send comment'
						variant='solidPink'
						size='sm'
						alignSelf={{ base: 'end', md: 'auto' }}
						disabled={!canPublishComment}
						loading={isCreatingComment}
						onClick={() => {
							void onPublishComment();
						}}
					>
						<SendHorizontal />
					</IconButton>
				</Flex>
				{!poemIsCommentable && (
					<Text textStyle='smaller' color='pink.200'>
						Comments are disabled for this poem.
					</Text>
				)}
				{!isAuthenticated && (
					<Text textStyle='smaller' color='pink.200'>
						Sign in to comment.
					</Text>
				)}
				{commentError && (
					<Text textStyle='smaller' color='red.400'>
						{commentError}
					</Text>
				)}
			</Flex>

			<Box borderTop='1px solid' borderColor='purple.700' pt={2}>
				<AsyncState
					isLoading={isLoadingComments}
					isError={isCommentsError}
					isEmpty={comments.length === 0}
					loadingElement={<Text textStyle='smaller'>Loading comments...</Text>}
					errorElement={
						<Box
							role='alert'
							w='full'
							border='1px solid'
							borderColor='pink.500'
							borderRadius='xl'
							bg='rgba(255, 255, 255, 0.03)'
							p={4}
						>
							<Flex direction='column' align='start' gap={2}>
								<Text textStyle='smaller' color='pink.200' fontWeight='semibold'>
									COMMENTS UNAVAILABLE
								</Text>
								<Text textStyle='smaller' color='pink.100'>
									We could not load comments right now. Please try again in a moment, or refresh the page.
								</Text>
								<Button size='xs' colorPalette='pink' variant='solid' onClick={() => window.location.reload()}>
									Refresh comments
								</Button>
							</Flex>
						</Box>
					}
					emptyElement={
						!isAuthenticated ? (
							<Text textStyle='smaller'>Sign in to see the comments.</Text>
						) : (
							<Text textStyle='smaller'>Be the first to comment.</Text>
						)
					}
				>
					<Flex direction='column' gap={0}>
						{renderedThreads}
					</Flex>
				</AsyncState>
				{hasMoreComments && (
					<Flex justify='center' mt={4}>
						<Button
							variant='outlinePurple'
							size='xs'
							onClick={() => {
								void onLoadMoreComments();
							}}
							loading={isLoadingMoreComments}
						>
							Load more comments
						</Button>
					</Flex>
				)}
			</Box>
		</Box>
	);
});
