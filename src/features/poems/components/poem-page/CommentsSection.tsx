import { memo, useMemo, type Dispatch, type SetStateAction } from 'react';
import { Box, Button, Flex, Heading, Text, Textarea } from '@chakra-ui/react';
import { AsyncState } from '@features/base';
import { CommentThread } from '../CommentThread';
import type { PoemCommentType } from '@features/interactions';

type CommentsSectionProps = {
	poemIsCommentable: boolean;
	commentInput: string;
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
	deleteComment: (id: number) => Promise<void>;
	likeComment: (id: number) => Promise<void>;
	unlikeComment: (id: number) => Promise<void>;
	fetchReplies: (parentId: number) => Promise<PoemCommentType[]>;
};

export const CommentsSection = memo(function CommentsSection({
	poemIsCommentable,
	commentInput,
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
		poemIsCommentable && commentInput.trim().length > 0 && !isCreatingComment;

	const renderedThreads = useMemo(
		() =>
			comments.map((comment) => (
				<CommentThread
					key={comment.id}
					comment={comment}
					authClientId={authClientId}
					poemIsCommentable={poemIsCommentable}
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
				Comentarios
			</Heading>

			<Flex direction='column' gap={3} mb={6}>
				<Textarea
					value={commentInput}
					onChange={(e) => onCommentInputChange(e.target.value)}
					placeholder='Escreva um comentario (1-300 caracteres)'
					rows={4}
					maxLength={300}
					disabled={!poemIsCommentable || isCreatingComment}
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
						Publicar comentario
					</Button>
				</Flex>
				{!poemIsCommentable && (
					<Text textStyle='small' color='pink.200'>
						Comentarios desativados para este poema.
					</Text>
				)}
			</Flex>

			<AsyncState
				isLoading={isLoadingComments}
				isError={isCommentsError}
				isEmpty={comments.length === 0}
				loadingElement={<Text textStyle='body'>Carregando comentarios...</Text>}
				errorElement={<Text textStyle='body'>Erro ao carregar comentarios.</Text>}
				emptyElement={<Text textStyle='body'>Seja o primeiro a comentar.</Text>}
			>
				<Flex direction='column' gap={3}>
					{renderedThreads}
				</Flex>
			</AsyncState>
		</Box>
	);
});
