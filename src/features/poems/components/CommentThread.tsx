/* eslint-disable max-lines-per-function */
import { Box, Button, Flex, IconButton, Text, Textarea } from '@chakra-ui/react';
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
import { formatDate } from '@features/base';

interface CommentThreadProps {
	comment: PoemCommentType;
	authClientId: number;
	poemIsCommentable: boolean;
	isCreatingComment: boolean;
	isDeletingComment: boolean;
	createComment: (args: { content: string; parentId?: number }) => Promise<void>;
	deleteComment: (id: number) => Promise<void>;
	likeComment: (id: number) => Promise<void>;
	unlikeComment: (id: number) => Promise<void>;
	isUpdatingCommentLike: boolean;
	fetchReplies: (parentId: number) => Promise<PoemCommentType[]>;
	repliesByCommentId: Record<number, PoemCommentType[]>;
	setRepliesByCommentId: React.Dispatch<React.SetStateAction<Record<number, PoemCommentType[]>>>;
}

export const CommentThread = memo(function CommentThread({
	comment,
	authClientId,
	poemIsCommentable,
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
				setReplyError('Erro ao carregar respostas.');
			}
		}
	}

	async function handleCreateReply() {
		if (!replyInput.trim()) return;
		try {
			await createComment({ content: replyInput.trim(), parentId: comment.id });
			setReplyInput('');
			const fetched = await fetchReplies(comment.id);
			setRepliesByCommentId((prev) => ({ ...prev, [comment.id]: fetched }));
		} catch {
			setReplyError('Erro ao enviar resposta.');
		}
	}

	async function handleDelete() {
		await deleteComment(comment.id);
		if (comment.parentId) {
			const parentReplies = await fetchReplies(comment.parentId);
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
					<Text textStyle='smaller' color='pink.200' mb={1}>
						@{comment.author.nickname}
					</Text>
					<Text textStyle='smaller' color='pink.200' mb={2}>
						{formatDate(comment.createdAt)}
					</Text>
					<Text textStyle='small'>{comment.content}</Text>
				</Box>
				{comment.author.id === authClientId && (
					<IconButton
						size='xs'
						variant='solidPink'
						colorPalette='gray'
						aria-label='Excluir comentário'
						title='Excluir comentário'
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
						aria-label={activeReplyFor === comment.id ? 'Fechar resposta' : 'Responder comentário'}
						title={activeReplyFor === comment.id ? 'Fechar resposta' : 'Responder comentário'}
						onClick={handleToggleReplies}
					>
						<MessageCircleReply />
					</IconButton>
					<IconButton
						size='xs'
						variant='solidPink'
						colorPalette='gray'
						aria-label={comment.likedByCurrentUser ? 'Descurtir comentário' : 'Curtir comentário'}
						title={comment.likedByCurrentUser ? 'Descurtir comentário' : 'Curtir comentário'}
						loading={isUpdatingCommentLike}
						onClick={() =>
							comment.likedByCurrentUser ? unlikeComment(comment.id) : likeComment(comment.id)
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
							{comment.aggregateChildrenCount} resposta(s)
						</Text>
						{!hasLoadedReplies && (
							<IconButton
								size='xs'
								variant='solidPink'
								colorPalette='gray'
								aria-label='Ver respostas'
								title='Ver respostas'
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
							placeholder='Responder comentário'
							rows={3}
							maxLength={300}
							disabled={!poemIsCommentable || isCreatingComment}
						/>
						<Flex justify='flex-end'>
							<IconButton
								size='sm'
								variant='solidPink'
								aria-label='Enviar resposta'
								title='Enviar resposta'
								disabled={!replyInput.trim() || !poemIsCommentable || isCreatingComment}
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
