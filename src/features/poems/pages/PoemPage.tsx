/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Avatar, Box, Button, Flex, Heading, Icon, Link, Text, Textarea } from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { AsyncState, MarkdownRenderer, toaster } from '@features/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { type PoemCommentType, usePoemComments, usePoemLike } from '@features/interactions';

import { usePoem } from '../hooks/usePoem';
import { useSavedPoems } from '../hooks/useSavedPoems';
import { PoemHeader } from '../components/PoemHeader';
import { CommentThread } from '../components/CommentThread';

function parsePoemId(rawId: string | undefined) {
	if (!rawId) return -1;
	const parsed = Number(rawId);
	if (!Number.isFinite(parsed) || parsed <= 0) return -1;
	return parsed;
}

type PoemAuthorCardProps = {
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string | null;
	};
	stats: {
		likesCount: number;
		commentsCount: number;
	};
	children: React.ReactNode;
};

const PoemAuthorCard = memo(function PoemAuthorCard({
	author,
	stats,
	children,
}: PoemAuthorCardProps) {
	return (
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
			<Avatar.Root size='xl'>
				<Avatar.Image src={author.avatarUrl ?? undefined} />
				<Avatar.Fallback name={author.name} />
			</Avatar.Root>

			<Flex direction='column' gap={1} flex='1'>
				<Text textStyle='small' color='pink.200'>
					Autor
				</Text>
				<Text textStyle='body'>{author.name}</Text>
				<Text textStyle='smaller' color='pink.200'>
					@{author.nickname}
				</Text>
				<Text textStyle='smaller' color='pink.200'>
					Curtidas: {stats.likesCount} | Coment�rios: {stats.commentsCount}
				</Text>
			</Flex>

			<Link asChild textStyle='small' color='pink.100'>
				<NavLink to={`/authors/${author.id}`}>Ver autor</NavLink>
			</Link>

			{children}
		</Flex>
	);
});

type PoemActionsProps = {
	authClientId: number;
	likedPoem: boolean;
	isSaved: boolean;
	isUpdatingLike: boolean;
	isSavingPoem: boolean;
	onToggleLike: () => Promise<void>;
	onToggleSave: () => Promise<void>;
};

const PoemActions = memo(function PoemActions({
	authClientId,
	likedPoem,
	isSaved,
	isUpdatingLike,
	isSavingPoem,
	onToggleLike,
	onToggleSave,
}: PoemActionsProps) {
	if (authClientId <= 0) return null;

	return (
		<>
			<Button
				size='sm'
				variant='solidPink'
				colorPalette='gray'
				loading={isUpdatingLike}
				onClick={() => {
					void onToggleLike();
				}}
			>
				{likedPoem ? 'Descurtir poema' : 'Curtir poema'}
			</Button>
			<Button
				size='sm'
				variant='solidPink'
				loading={isSavingPoem}
				onClick={() => {
					void onToggleSave();
				}}
			>
				{isSaved ? 'Remover dos salvos' : 'Salvar poema'}
			</Button>
		</>
	);
});

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
	setRepliesByCommentId: React.Dispatch<React.SetStateAction<Record<number, PoemCommentType[]>>>;
	onCommentInputChange: (value: string) => void;
	onPublishComment: () => Promise<void>;
	createComment: (args: { content: string; parentId?: number }) => Promise<void>;
	deleteComment: (id: number) => Promise<void>;
	likeComment: (id: number) => Promise<void>;
	unlikeComment: (id: number) => Promise<void>;
	fetchReplies: (parentId: number) => Promise<PoemCommentType[]>;
};

const CommentsSection = memo(function CommentsSection({
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
				Coment�rios
			</Heading>

			<Flex direction='column' gap={3} mb={6}>
				<Textarea
					value={commentInput}
					onChange={(e) => onCommentInputChange(e.target.value)}
					placeholder='Escreva um coment�rio (1-300 caracteres)'
					rows={4}
					maxLength={300}
					disabled={!poemIsCommentable || isCreatingComment}
				/>
				<Flex align='center' justify='space-between'>
					<Text textStyle='smaller' color='pink.200'>
						{commentInput.length}/300
					</Text>
					<Button
						variant='solidPink'
						disabled={!canPublishComment}
						loading={isCreatingComment}
						onClick={() => {
							void onPublishComment();
						}}
					>
						Publicar coment�rio
					</Button>
				</Flex>
				{!poemIsCommentable && (
					<Text textStyle='small' color='pink.200'>
						Coment�rios desativados para este poema.
					</Text>
				)}
			</Flex>

			<AsyncState
				isLoading={isLoadingComments}
				isError={isCommentsError}
				isEmpty={comments.length === 0}
				loadingElement={<Text textStyle='body'>Carregando coment�rios...</Text>}
				errorElement={<Text textStyle='body'>Erro ao carregar coment�rios.</Text>}
				emptyElement={<Text textStyle='body'>Seja o primeiro a comentar.</Text>}
			>
				<Flex direction='column' gap={3}>
					{renderedThreads}
				</Flex>
			</AsyncState>
		</Box>
	);
});

export function PoemPage() {
	const { id } = useParams<{ id: string }>();
	const poemId = useMemo(() => parsePoemId(id), [id]);
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);
	const isPoemIdValid = poemId > 0;

	const [commentInput, setCommentInput] = useState('');
	const [repliesByCommentId, setRepliesByCommentId] = useState<Record<number, PoemCommentType[]>>(
		{},
	);
	const [likedPoem, setLikedPoem] = useState(false);

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
	} = usePoemComments(poemId);
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

	const loadedReplyParentsRef = useRef<Set<number>>(new Set());
	const loadingReplyParentsRef = useRef<Set<number>>(new Set());
	const shownErrorsRef = useRef<Record<string, string>>({});

	useEffect(() => {
		if (!poem) return;
		setLikedPoem(poem.stats.likedByCurrentUser);
	}, [poem]);

	useEffect(() => {
		if (!comments.length) return;
		let isMounted = true;

		for (const parent of comments) {
			if (parent.aggregateChildrenCount <= 0) continue;
			if (loadedReplyParentsRef.current.has(parent.id)) continue;
			if (loadingReplyParentsRef.current.has(parent.id)) continue;

			loadingReplyParentsRef.current.add(parent.id);
			void fetchReplies(parent.id)
				.then((replies) => {
					if (!isMounted) return;
					setRepliesByCommentId((prev) => {
						if (prev[parent.id]) return prev;
						return { ...prev, [parent.id]: replies };
					});
					loadedReplyParentsRef.current.add(parent.id);
				})
				.catch(() => {
					if (!isMounted) return;
					toaster.create({
						type: 'error',
						title: 'Erro ao carregar respostas',
						description: 'N�o foi possivel buscar algumas respostas.',
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
	}, [comments, fetchReplies]);

	const showErrorToast = useCallback((key: string, message: string) => {
		if (!message) return;
		if (shownErrorsRef.current[key] === message) return;
		shownErrorsRef.current[key] = message;
		toaster.create({
			type: 'error',
			title: 'Opera��o falhou',
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

		try {
			await createComment({ content });
			setCommentInput('');
			toaster.create({
				type: 'success',
				title: 'Coment�rio publicado',
				closable: true,
			});
		} catch {
			// Erro tratado por createCommentError + toast consolidado.
		}
	}, [commentInput, createComment]);

	const handleTogglePoemLike = useCallback(async () => {
		try {
			if (likedPoem) {
				await unlikePoem();
				setLikedPoem(false);
				toaster.create({
					type: 'success',
					title: 'Curtida removida',
					closable: true,
				});
				return;
			}

			await likePoem();
			setLikedPoem(true);
			toaster.create({
				type: 'success',
				title: 'Poema curtido',
				closable: true,
			});
		} catch {
			// Erro tratado por likeError + toast consolidado.
		}
	}, [likedPoem, likePoem, unlikePoem]);

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
					<Box textStyle='body'>ID de poema inv�lido.</Box>
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
					emptyElement={<Box textStyle='body'>Poema n�o encontrado</Box>}
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
							</Box>

							<PoemAuthorCard author={poem.author} stats={poem.stats}>
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

							<CommentsSection
								poemIsCommentable={poem.isCommentable}
								commentInput={commentInput}
								authClientId={authClientId}
								comments={comments}
								isLoadingComments={isLoadingComments}
								isCommentsError={isCommentsError}
								isCreatingComment={isCreatingComment}
								isDeletingComment={isDeletingComment}
								isUpdatingCommentLike={isUpdatingCommentLike}
								repliesByCommentId={repliesByCommentId}
								setRepliesByCommentId={setRepliesByCommentId}
								onCommentInputChange={setCommentInput}
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
