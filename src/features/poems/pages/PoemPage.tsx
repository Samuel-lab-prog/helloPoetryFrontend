/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Box, Button, Flex, Heading, Icon, Link } from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { AsyncState, MarkdownRenderer, findForbiddenWords, toaster } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { type PoemCommentType, usePoemComments, usePoemLike } from '@features/interactions';

import { usePoem } from '../hooks/usePoem';
import { useSavedPoems } from '../hooks/useSavedPoems';
import { PoemHeader } from '../components/PoemHeader';
import { PoemAuthorCard } from '../components/poem-page/PoemAuthorCard';
import { PoemActions } from '../components/poem-page/PoemActions';
import { CommentsSection } from '../components/poem-page/CommentsSection';
import { PoemAudioPlayer } from '../components/poem-page/PoemAudioPlayer';

function parsePoemId(rawId: string | undefined) {
	if (!rawId) return -1;
	const parsed = Number(rawId);
	if (!Number.isFinite(parsed) || parsed <= 0) return -1;
	return parsed;
}

export function PoemPage() {
	const { id } = useParams<{ id: string }>();
	const poemId = useMemo(() => parsePoemId(id), [id]);
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);
	const isAuthenticated = authClientId > 0;
	const isPoemIdValid = poemId > 0;

	const [commentInput, setCommentInput] = useState('');
	const [commentInputError, setCommentInputError] = useState('');
	const [repliesByCommentId, setRepliesByCommentId] = useState<Record<number, PoemCommentType[]>>(
		{},
	);
	const [likedPoem, setLikedPoem] = useState(false);
	const [likesCount, setLikesCount] = useState(0);

	const { poem, isError, isLoading } = usePoem(poemId);
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
		likeComment,
		unlikeComment,
		isUpdatingCommentLike,
		likeCommentError,
		fetchReplies,
	} = usePoemComments(poemId, { enabled: isAuthenticated });
	const { likePoem, unlikePoem, isUpdatingLike, likeError } = usePoemLike(poemId);
	const { savedPoems, savePoem, unsavePoem, isSavingPoem, saveError } = useSavedPoems(
		authClientId > 0,
	);

	const isSaved = useMemo(
		() => savedPoems.some((savedPoem: { id: number }) => savedPoem.id === poemId),
		[savedPoems, poemId],
	);
	const poemHeaderPoem = useMemo(
		() =>
			poem
				? {
						title: poem.title,
						excerpt: poem.excerpt,
						tags: poem.tags,
						createdAt: poem.createdAt,
						updatedAt: poem.updatedAt,
					}
				: null,
		[poem],
	);
	const immersiveUrl = useMemo(() => {
		if (!poem) return '';
		return poem.slug ? `/poems/${poem.slug}/${poem.id}/immersive` : `/poems/${poem.id}/immersive`;
	}, [poem]);

	const loadingReplyParentsRef = useRef<Set<number>>(new Set());
	const shownErrorsRef = useRef<Record<string, string>>({});

	useEffect(() => {
		if (!poem) return;
		setLikedPoem(poem.stats.likedByCurrentUser);
		setLikesCount(poem.stats.likesCount);
	}, [poem]);

	useEffect(() => {
		if (!comments.length) return;
		let isMounted = true;

		for (const parent of comments) {
			if (parent.aggregateChildrenCount <= 0) continue;
			const existingRepliesCount = repliesByCommentId[parent.id]?.length ?? 0;
			if (existingRepliesCount >= parent.aggregateChildrenCount) continue;
			if (loadingReplyParentsRef.current.has(parent.id)) continue;

			loadingReplyParentsRef.current.add(parent.id);
			void fetchReplies(parent.id)
				.then((replies) => {
					if (!isMounted) return;
					setRepliesByCommentId((prev) => {
						if (prev[parent.id]) return prev;
						return { ...prev, [parent.id]: replies };
					});
				})
				.catch(() => {
					if (!isMounted) return;
					toaster.create({
						type: 'error',
						title: 'Erro ao carregar respostas',
						description: 'Nao foi possivel buscar algumas respostas.',
						closable: true,
					});
				})
				.finally(() => {
					loadingReplyParentsRef.current.delete(parent.id);
				});
		}

		return () => {
			isMounted = false;
		};
	}, [comments, fetchReplies, repliesByCommentId]);

	const showErrorToast = useCallback((key: string, message: string) => {
		if (!message) return;
		if (shownErrorsRef.current[key] === message) return;
		shownErrorsRef.current[key] = message;
		toaster.create({
			type: 'error',
			title: 'Operacao falhou',
			description: message,
			closable: true,
		});
	}, []);

	useEffect(() => {
		showErrorToast('likeError', likeError);
	}, [likeError, showErrorToast]);

	useEffect(() => {
		showErrorToast('saveError', saveError);
	}, [saveError, showErrorToast]);

	useEffect(() => {
		showErrorToast('createCommentError', createCommentError);
	}, [createCommentError, showErrorToast]);

	useEffect(() => {
		showErrorToast('deleteCommentError', deleteCommentError);
	}, [deleteCommentError, showErrorToast]);

	useEffect(() => {
		showErrorToast('likeCommentError', likeCommentError);
	}, [likeCommentError, showErrorToast]);

	const handlePublishComment = useCallback(async () => {
		const content = commentInput.trim();
		if (!content) return;
		const forbiddenWordsFound = findForbiddenWords(content);
		if (forbiddenWordsFound.length > 0) {
			setCommentInputError(`Remova palavras proibidas: ${forbiddenWordsFound.join(', ')}`);
			return;
		}

		try {
			await createComment({ content });
			setCommentInput('');
			setCommentInputError('');
			toaster.create({
				type: 'success',
				title: 'Comentario publicado',
				closable: true,
			});
		} catch {
			// Erro tratado por createCommentError + toast consolidado.
		}
	}, [commentInput, createComment]);

	const handleCommentInputChange = useCallback(
		(value: string) => {
			setCommentInput(value);
			if (commentInputError) setCommentInputError('');
		},
		[commentInputError],
	);

	const handleTogglePoemLike = useCallback(async () => {
		if (isUpdatingLike) return;
		const nextLiked = !likedPoem;
		const previousLiked = likedPoem;
		const previousLikesCount = likesCount;
		const nextLikesCount = Math.max(0, previousLikesCount + (nextLiked ? 1 : -1));

		setLikedPoem(nextLiked);
		setLikesCount(nextLikesCount);

		try {
			if (!nextLiked) {
				await unlikePoem();
				toaster.create({
					type: 'success',
					title: 'Curtida removida',
					closable: true,
				});
				return;
			}

			await likePoem();
			toaster.create({
				type: 'success',
				title: 'Poema curtido',
				closable: true,
			});
		} catch {
			setLikedPoem(previousLiked);
			setLikesCount(previousLikesCount);
			// Erro tratado por likeError + toast consolidado.
		}
	}, [isUpdatingLike, likedPoem, likesCount, likePoem, unlikePoem]);

	const handleToggleSavePoem = useCallback(async () => {
		try {
			if (isSaved) {
				await unsavePoem(poemId);
				toaster.create({
					type: 'success',
					title: 'Poema removido dos salvos',
					closable: true,
				});
				return;
			}

			await savePoem(poemId);
			toaster.create({
				type: 'success',
				title: 'Poema salvo com sucesso',
				closable: true,
			});
		} catch {
			// Erro tratado por saveError + toast consolidado.
		}
	}, [isSaved, poemId, savePoem, unsavePoem]);

	if (!isPoemIdValid) {
		return (
			<Flex as='main' layerStyle='main' direction='column' alignItems='center'>
				<Box as='section' maxW='4xl' w='full'>
					<Box textStyle='body'>ID de poema invalido.</Box>
				</Box>
			</Flex>
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
						<Box textStyle='body'>Erro ao carregar o poema. Tente novamente mais tarde</Box>
					}
					loadingElement={<Box textStyle='body'>Carregando poema...</Box>}
				>
					{poem && poemHeaderPoem && (
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
								<PoemHeader poem={poemHeaderPoem} />
								{immersiveUrl && (
									<Flex justify='flex-end' mb={4}>
										<Button asChild size='sm' variant='outlinePurple'>
											<NavLink to={immersiveUrl}>Modo imersivo</NavLink>
										</Button>
									</Flex>
								)}

								<PoemAuthorCard
									embedded
									author={poem.author}
									stats={{
										...poem.stats,
										likesCount,
									}}
								>
									<PoemActions
										authClientId={authClientId}
										likedPoem={likedPoem}
										isSaved={isSaved}
										isUpdatingLike={isUpdatingLike}
										isSavingPoem={isSavingPoem}
										onToggleLike={handleTogglePoemLike}
										onToggleSave={handleToggleSavePoem}
									/>
								</PoemAuthorCard>
							</Box>

							<Box
								as='article'
								display='flex'
								mt={8}
								p={[4, 6]}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='xl'
								bg='rgba(255, 255, 255, 0.03)'
								whiteSpace='pre-wrap'
								wordBreak='break-word'
								textStyle='small'
								overflowX='hidden'
								css={{
									'& pre, & table': {
										maxWidth: '100%',
										overflowX: 'auto',
									},
								}}
							>
								<Box w='full' maxW='3xl' textAlign='left'>
									{poem.audioUrl && (
										<Box mb={6}>
											<PoemAudioPlayer src={poem.audioUrl} />
										</Box>
									)}
									<Heading as='h2' textStyle='h2' color='pink.300' mb={4}>
										{poem.title}
									</Heading>
									<MarkdownRenderer content={poem.content} />
								</Box>
							</Box>

							<CommentsSection
								poemIsCommentable={poem.isCommentable}
								isAuthenticated={isAuthenticated}
								commentInput={commentInput}
								commentError={commentInputError}
								authClientId={authClientId}
								comments={comments}
								isLoadingComments={isLoadingComments}
								isCommentsError={isCommentsError}
								isCreatingComment={isCreatingComment}
								isDeletingComment={isDeletingComment}
								isUpdatingCommentLike={isUpdatingCommentLike}
								repliesByCommentId={repliesByCommentId}
								setRepliesByCommentId={setRepliesByCommentId}
								onCommentInputChange={handleCommentInputChange}
								onPublishComment={handlePublishComment}
								createComment={createComment}
								deleteComment={deleteComment}
								likeComment={likeComment}
								unlikeComment={unlikeComment}
								fetchReplies={fetchReplies}
							/>
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
