/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
	Avatar,
	Box,
	Button,
	Link,
	Flex,
	Icon,
	Text,
	Textarea,
	Heading,
} from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { AsyncState, formatDate, MarkdownRenderer } from '@features/base';
import {
	type PoemCommentType,
	usePoemComments,
	useSavedPoems,
} from '@features/interactions';
import { usePost } from '../hooks/usePost';
import { PostHeader } from '../components/PostHeader';

function getAuthClientId() {
	try {
		const raw = localStorage.getItem('auth-client');
		if (!raw) return -1;
		const parsed = JSON.parse(raw) as { id?: number };
		return parsed.id ?? -1;
	} catch {
		return -1;
	}
}

export function PostPage() {
	const { id } = useParams<{ id: string }>();
	const poemId = Number(id);
	const authClientId = getAuthClientId();
	const [commentInput, setCommentInput] = useState('');
	const [activeReplyFor, setActiveReplyFor] = useState<number | null>(null);
	const [replyInput, setReplyInput] = useState('');
	const [repliesByCommentId, setRepliesByCommentId] = useState<
		Record<number, PoemCommentType[]>
	>({});
	const [replyError, setReplyError] = useState('');
	const [saveInfo, setSaveInfo] = useState('');

	const { poem, isError, isLoading } = usePost(poemId);
	const {
		comments,
		isLoadingComments,
		isCommentsError,
		createComment,
		isCreatingComment,
		createCommentError,
		deleteComment,
		isDeletingComment,
		deleteCommentError,
		fetchReplies,
	} = usePoemComments(poemId);
	const { savedPoems, savePoem, unsavePoem, isSavingPoem, saveError } =
		useSavedPoems(authClientId > 0);
	const isSaved = savedPoems.some((p) => p.id === poemId);

	useEffect(() => {
		async function preloadReplies() {
			const parentsWithReplies = comments.filter(
				(comment) => comment.aggregateChildrenCount > 0,
			);

			for (const parent of parentsWithReplies) {
				if (repliesByCommentId[parent.id]) continue;
				try {
					const replies = await fetchReplies(parent.id);
					setRepliesByCommentId((prev) => ({ ...prev, [parent.id]: replies }));
				} catch {
					// Keep the page usable even if a specific replies request fails.
				}
			}
		}

		void preloadReplies();
	}, [comments, fetchReplies, repliesByCommentId]);

	async function handleToggleReplies(commentId: number) {
		if (activeReplyFor === commentId) {
			setActiveReplyFor(null);
			setReplyInput('');
			setReplyError('');
			return;
		}

		setActiveReplyFor(commentId);
		setReplyError('');
		setReplyInput('');
		if (!repliesByCommentId[commentId]) {
			try {
				const replies = await fetchReplies(commentId);
				setRepliesByCommentId((prev) => ({ ...prev, [commentId]: replies }));
			} catch {
				setReplyError('Erro ao carregar respostas.');
			}
		}
	}

	async function handleCreateReply(parentId: number) {
		try {
			await createComment({ content: replyInput.trim(), parentId });
			setReplyInput('');
			const replies = await fetchReplies(parentId);
			setRepliesByCommentId((prev) => ({ ...prev, [parentId]: replies }));
		} catch {
			setReplyError('Erro ao enviar resposta.');
		}
	}

	async function handleDelete(comment: PoemCommentType) {
		await deleteComment(comment.id);
		if (comment.parentId) {
			const parentReplies = await fetchReplies(comment.parentId);
			setRepliesByCommentId((prev) => ({
				...prev,
				[comment.parentId!]: parentReplies,
			}));
		}
	}

	async function loadRepliesFor(comment: PoemCommentType) {
		try {
			const replies = await fetchReplies(comment.id);
			setRepliesByCommentId((prev) => ({ ...prev, [comment.id]: replies }));
		} catch {
			setReplyError('Erro ao carregar respostas.');
		}
	}

	function renderCommentThread(comment: PoemCommentType, depth = 0) {
		const replies = repliesByCommentId[comment.id] ?? [];
		const hasReplies = comment.aggregateChildrenCount > 0;
		const hasLoadedReplies = replies.length > 0;

		return (
			<Box
				key={comment.id}
				p={3}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='md'
				bg='rgba(255, 255, 255, 0.02)'
				ml={depth > 0 ? 4 : 0}
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
						<Button
							size='xs'
							variant='surface'
							colorPalette='gray'
							loading={isDeletingComment}
							onClick={() => handleDelete(comment)}
						>
							Excluir
						</Button>
					)}
				</Flex>

				<Flex mt={3} justify='space-between' align='center' gap={2} wrap='wrap'>
					<Button
						size='xs'
						variant='surface'
						colorPalette='gray'
						onClick={() => handleToggleReplies(comment.id)}
					>
						Responder
					</Button>
					{hasReplies && (
						<Flex align='center' gap={2}>
							<Text textStyle='smaller' color='pink.200'>
								{comment.aggregateChildrenCount} resposta(s)
							</Text>
							{!hasLoadedReplies && (
								<Button
									size='xs'
									variant='surface'
									colorPalette='gray'
									onClick={() => loadRepliesFor(comment)}
								>
									Ver respostas
								</Button>
							)}
						</Flex>
					)}
				</Flex>

				{hasLoadedReplies && (
					<Box mt={3} pl={4} borderLeft='1px solid' borderColor='purple.700'>
						<Flex direction='column' gap={2}>
							{replies.map((reply) => renderCommentThread(reply, depth + 1))}
						</Flex>
					</Box>
				)}

				{activeReplyFor === comment.id && (
					<Box mt={3} pl={4} borderLeft='1px solid' borderColor='purple.700'>
						<Flex direction='column' gap={2}>
							<Textarea
								value={replyInput}
								onChange={(e) => setReplyInput(e.target.value)}
								placeholder='Responder comentario'
								rows={3}
								maxLength={300}
								disabled={!poem?.isCommentable || isCreatingComment}
							/>
							<Flex justify='flex-end'>
								<Button
									size='sm'
									variant='surface'
									disabled={
										replyInput.trim().length === 0 ||
										!poem?.isCommentable ||
										isCreatingComment
									}
									loading={isCreatingComment}
									onClick={() => handleCreateReply(comment.id)}
								>
									Enviar resposta
								</Button>
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
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' alignItems='center'>
			<Box as='section' maxW='4xl' w='full'>
				<AsyncState
					isLoading={isLoading}
					isError={!!isError}
					isEmpty={!poem}
					emptyElement={<Box textStyle='body'>Poema nao encontrado</Box>}
					errorElement={
						<Box textStyle='body'>
							Erro ao carregar o poema. Tente novamente mais tarde
						</Box>
					}
					loadingElement={<Box textStyle='body'>Carregando poema...</Box>}
				>
					{poem && (
						<>
							<Box
								p={[4, 6]}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='2xl'
								bg='linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
								backdropFilter='blur(4px)'
								mb={6}
							>
								<PostHeader
									poem={{
										title: poem.title,
										excerpt: poem.excerpt,
										tags: poem.tags,
										createdAt: poem.createdAt,
										updatedAt: poem.updatedAt,
									}}
								/>
							</Box>

							<Flex
								mt={6}
								p={4}
								gap={3}
								align='center'
								border='1px solid'
								borderColor='purple.700'
								borderRadius='lg'
								bg='rgba(255, 255, 255, 0.02)'
							>
								<Avatar.Root size='lg'>
									<Avatar.Image src={poem.author.avatarUrl ?? undefined} />
									<Avatar.Fallback name={poem.author.name} />
								</Avatar.Root>

								<Flex direction='column' gap={1} flex='1'>
									<Text textStyle='small' color='pink.200'>
										Autor
									</Text>
									<Text textStyle='body'>{poem.author.name}</Text>
									<Text textStyle='smaller' color='pink.200'>
										@{poem.author.nickname}
									</Text>
									<Text textStyle='smaller' color='pink.200'>
										Curtidas: {poem.stats.likesCount} | Comentarios:{' '}
										{poem.stats.commentsCount}
									</Text>
								</Flex>

								<Link asChild textStyle='small' color='pink.100'>
									<NavLink to={`/authors/${poem.author.id}`}>Ver autor</NavLink>
								</Link>
								{authClientId > 0 && (
									<Button
										size='sm'
										variant='surface'
										loading={isSavingPoem}
										onClick={async () => {
											if (isSaved) {
												await unsavePoem(poemId);
												setSaveInfo('Poema removido dos salvos.');
											} else {
												await savePoem(poemId);
												setSaveInfo('Poema salvo com sucesso.');
											}
										}}
									>
										{isSaved ? 'Remover dos salvos' : 'Salvar poema'}
									</Button>
								)}
							</Flex>
							{(saveInfo || saveError) && (
								<Text mt={2} textStyle='small' color={saveError ? 'red.400' : 'pink.200'}>
									{saveError || saveInfo}
								</Text>
							)}

							<Box
								as='article'
								textAlign='justify'
								mt={8}
								p={[4, 6]}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='xl'
								bg='rgba(255, 255, 255, 0.03)'
								whiteSpace='pre-wrap'
								wordBreak='break-word'
								textStyle='small'
							>
								<MarkdownRenderer content={poem.content} />
							</Box>

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
										onChange={(e) => setCommentInput(e.target.value)}
										placeholder='Escreva um comentario (1-300 caracteres)'
										rows={4}
										maxLength={300}
										disabled={!poem.isCommentable || isCreatingComment}
									/>
									<Flex align='center' justify='space-between'>
										<Text textStyle='smaller' color='pink.200'>
											{commentInput.length}/300
										</Text>
										<Button
											variant='surface'
											disabled={
												!poem.isCommentable ||
												commentInput.trim().length === 0 ||
												isCreatingComment
											}
											loading={isCreatingComment}
											onClick={async () => {
												await createComment({
													content: commentInput.trim(),
												});
												setCommentInput('');
											}}
										>
											Publicar comentario
										</Button>
									</Flex>
									{!poem.isCommentable && (
										<Text textStyle='small' color='pink.200'>
											Comentarios desativados para este poema.
										</Text>
									)}
									{createCommentError && (
										<Text textStyle='small' color='red.400'>
											{createCommentError}
										</Text>
									)}
									{deleteCommentError && (
										<Text textStyle='small' color='red.400'>
											{deleteCommentError}
										</Text>
									)}
								</Flex>

								<AsyncState
									isLoading={isLoadingComments}
									isError={isCommentsError}
									isEmpty={comments.length === 0}
									loadingElement={
										<Text textStyle='body'>Carregando comentarios...</Text>
									}
									errorElement={
										<Text textStyle='body'>Erro ao carregar comentarios.</Text>
									}
									emptyElement={
										<Text textStyle='body'>Seja o primeiro a comentar.</Text>
									}
								>
									<Flex direction='column' gap={3}>
										{comments.map((comment) => renderCommentThread(comment))}
									</Flex>
								</AsyncState>
							</Box>
						</>
					)}
				</AsyncState>
				<Box
					mt={8}
					w='full'
					justifyContent={['end', undefined, undefined, 'center']}
					display='flex'
				>
					<Link
						px={4}
						py={2}
						asChild
						color='pink.100'
						border='1px solid'
						borderColor='purple.500'
						borderRadius='md'
						transition='all 0.2s ease'
						_hover={{
							color: 'pink.50',
							borderColor: 'pink.400',
							bg: 'rgba(255, 255, 255, 0.06)',
						}}
					>
						<NavLink to='/poems'>
							<Icon as={ArrowLeftIcon} /> Voltar
						</NavLink>
					</Link>
				</Box>
			</Box>
		</Flex>
	);
}
