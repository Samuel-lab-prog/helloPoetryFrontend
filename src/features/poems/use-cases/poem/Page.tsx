/* eslint-disable max-lines-per-function */
import { AsyncState, ErrorStateCard, MarkdownRenderer, toaster } from '@BaseComponents';
import { Box, Button, Flex, Icon, Link } from '@chakra-ui/react';
import {
	getBannedPrivilegeMessage,
	getSuspendedPrivilegeMessage,
	isBannedAccessError,
	useAuthClientStore,
} from '@features/auth/public';
import { type PoemCommentType, usePoemComments, usePoemLike } from '@features/interactions/public';
import { ModerationActionsMenu } from '@features/moderation/public';
import { LoadingPoemSkeleton } from '@features/poems/public/components/LoadingPoemSkeleton';
import { PoemAudioPlayer } from '@features/poems/public/components/PoemAudioPlayer';
import { canUpdatePoem } from '@features/poems/public/utils/canUpdatePoem';
import { findForbiddenWords } from '@Utils';
import { ArrowLeftIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { useSavedPoems } from '../../public/hooks/useManageSavedPoems';
import { CommentsSection } from './components/CommentsSection';
import { PoemActions } from './components/PoemActions';
import { PoemAuthorCard } from './components/PoemAuthorCard';
import { PoemHeader } from './components/PoemHeader';
import { usePoem } from './hooks/usePoem';
import { getPoemErrorInfo } from './utils/getPoemErrorInfo';

function parsePoemId(rawId: string | undefined) {
	if (!rawId) return -1;
	const parsed = Number(rawId);
	if (!Number.isFinite(parsed) || parsed <= 0) return -1;
	return parsed;
}

export function PoemPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const poemId = useMemo(() => parsePoemId(id), [id]);
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);
	const authClientStatus = useAuthClientStore((state) => state.authClient?.status);
	const isAuthenticated = authClientId > 0;
	const isSuspended = authClientStatus === 'suspended';
	const isBanned = authClientStatus === 'banned';
	const isPoemIdValid = poemId > 0;

	const [commentInput, setCommentInput] = useState('');
	const [commentInputError, setCommentInputError] = useState('');
	const [repliesByCommentId, setRepliesByCommentId] = useState<Record<number, PoemCommentType[]>>(
		{},
	);
	const { poem, isError, isLoading, error: poemError } = usePoem(poemId);
	const isRejectedPoem = poem?.moderationStatus === 'rejected';
	const isPendingPoem = poem?.moderationStatus === 'pending';
	const isRemovedPoem = poem?.moderationStatus === 'removed';
	const isInteractionBlocked = isRejectedPoem || isPendingPoem || isRemovedPoem;
	const canEditRejectedPoem = Boolean(
		poem && authClientId === poem.author.id && canUpdatePoem(poem),
	);
	const isBannedPoemError = isBannedAccessError(poemError);
	const poemErrorInfo = getPoemErrorInfo(poemError);
	const {
		comments,
		isLoadingComments,
		isCommentsError,
		hasMoreComments,
		isLoadingMoreComments,
		loadMoreComments,
		createComment,
		isCreatingComment,
		commentsError,
		createCommentError,
		deleteComment,
		isDeletingComment,
		deleteCommentError,
		likeCommentError,
		fetchReplies,
		prefetchReplies,
	} = usePoemComments(poemId, {
		enabled: isAuthenticated && !isSuspended && !isBanned && !!poem && !isInteractionBlocked,
	});
	const { likePoem, unlikePoem, isUpdatingLike, likeError } = usePoemLike(poemId);
	const { savedPoems, savePoem, unsavePoem, updatingSavedPoemId, saveError } = useSavedPoems(
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
						moderationStatus: poem.moderationStatus,
						rejectionReason: poem.rejectionReason,
					}
				: null,
		[poem],
	);
	const moderationPoemTarget = useMemo(
		() =>
			poem
				? {
						id: poem.id,
						title: poem.title,
						status: poem.status,
						moderationStatus: poem.moderationStatus,
						author: {
							id: poem.author.id,
							name: poem.author.name,
							nickname: poem.author.nickname,
							avatarUrl: poem.author.avatarUrl,
						},
					}
				: undefined,
		[poem],
	);
	const immersiveUrl = useMemo(() => {
		if (!poem) return '';
		return poem.slug ? `/poems/${poem.slug}/${poem.id}/immersive` : `/poems/${poem.id}/immersive`;
	}, [poem]);
	const editPoemUrl = useMemo(() => {
		if (!poem) return '';
		return `/admin?mode=update&poemId=${poem.id}`;
	}, [poem]);

	const loadingReplyParentsRef = useRef<Set<number>>(new Set());
	const shownErrorsRef = useRef<Record<string, string>>({});

	const likedPoem = poem?.stats?.likedByCurrentUser ?? false;
	const commentRestrictionMessage = isBanned
		? getBannedPrivilegeMessage('view or write comments')
		: isSuspended
			? getSuspendedPrivilegeMessage('view or write comments')
			: '';

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
						title: 'Error loading replies',
						description: 'Could not fetch some replies.',
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
			title: 'Operation failed',
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
		if (commentRestrictionMessage) return;
		if (isInteractionBlocked) return;
		const content = commentInput.trim();
		if (!content) return;
		const forbiddenWordsFound = findForbiddenWords(content);
		if (forbiddenWordsFound.length > 0) {
			setCommentInputError(`Remove forbidden words: ${forbiddenWordsFound.join(', ')}`);
			return;
		}

		try {
			await createComment({ content });
			setCommentInput('');
			setCommentInputError('');
			toaster.create({
				type: 'success',
				title: 'Comment published',
				closable: true,
			});
		} catch {
			// Error handled by createCommentError + consolidated toast.
		}
	}, [commentInput, commentRestrictionMessage, createComment, isInteractionBlocked]);

	const handleCommentInputChange = useCallback(
		(value: string) => {
			setCommentInput(value);
			if (commentInputError) setCommentInputError('');
		},
		[commentInputError],
	);

	const handleTogglePoemLike = useCallback(async () => {
		if (isBanned) {
			showErrorToast('likeError', getBannedPrivilegeMessage('like poems'));
			return;
		}
		if (isSuspended) {
			showErrorToast('likeError', getSuspendedPrivilegeMessage('like poems'));
			return;
		}
		if (isInteractionBlocked) return;
		if (isUpdatingLike) return;

		try {
			if (likedPoem) {
				await unlikePoem();
				return;
			}

			await likePoem();
		} catch {
			// Error handled by likeError + consolidated toast.
		}
	}, [
		isInteractionBlocked,
		isBanned,
		isSuspended,
		isUpdatingLike,
		likedPoem,
		likePoem,
		showErrorToast,
		unlikePoem,
	]);

	const handleToggleSavePoem = useCallback(async () => {
		if (isBanned) {
			showErrorToast('saveError', getBannedPrivilegeMessage('save poems'));
			return;
		}
		if (isInteractionBlocked) return;
		if (updatingSavedPoemId === poemId) return;
		try {
			if (isSaved) {
				await unsavePoem(poemId);
				return;
			}

			await savePoem(poemId);
		} catch {
			// Error handled by saveError + consolidated toast.
		}
	}, [
		isBanned,
		isInteractionBlocked,
		isSaved,
		poemId,
		savePoem,
		showErrorToast,
		unsavePoem,
		updatingSavedPoemId,
	]);

	const handleBack = useCallback(() => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}
		navigate('/');
	}, [navigate]);

	if (!isPoemIdValid) {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<Box as='section' maxW='4xl' w='full'>
					<Box textStyle='small'>Invalid poem ID.</Box>
				</Box>
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
			<Box as='section' maxW='2xl' w='full'>
				<AsyncState
					isLoading={isLoading}
					isError={!!isError || isBannedPoemError}
					isEmpty={!poem}
					emptyElement={<Box textStyle='body'>Poem not found</Box>}
					errorElement={
						<ErrorStateCard
							eyebrow={poemErrorInfo.eyebrow}
							title={poemErrorInfo.title}
							description={poemErrorInfo.description}
							actionLabel={isBannedPoemError ? undefined : 'Refresh poem'}
							onAction={isBannedPoemError ? undefined : () => window.location.reload()}
						/>
					}
					loadingElement={<LoadingPoemSkeleton variant='default' />}
				>
					{poem && poemHeaderPoem && (
						<>
							<Box
								p={{ base: 4, md: 5 }}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='2xl'
								bg='linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
								backdropFilter='blur(4px)'
								mb={6}
							>
								<Flex align='start' justify='space-between' gap={3}>
									<Box minW={0} flex='1'>
										<PoemHeader
											poem={poemHeaderPoem}
											editHref={editPoemUrl}
											showEditPrompt={canEditRejectedPoem}
										/>
									</Box>
									<ModerationActionsMenu
										poem={moderationPoemTarget}
										size={{ base: 'xs', md: 'sm' }}
										variant='ghost'
									/>
								</Flex>
								<PoemAuthorCard embedded author={poem.author} />
							</Box>

							<Box
								as='article'
								display='flex'
								justifyContent='center'
								mt={6}
								p={{ base: 4, md: 5 }}
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
								<Box w='full' maxW='2xl' mx='auto'>
									{poem.audioUrl && (
										<Box mb={4} w='full' display='flex' justifyContent='center'>
											<PoemAudioPlayer src={poem.audioUrl} />
										</Box>
									)}
									{immersiveUrl && (
										<Box w='full' textAlign='center' mb={5}>
											<Button
												asChild
												size={{ base: 'sm', md: 'sm' }}
												variant='outlinePurple'
												px={{ base: 3.5, md: 4 }}
												py={{ base: 2, md: 2.5 }}
												bg='rgba(255, 255, 255, 0.04)'
												borderColor='pink.400'
												color='pink.50'
												boxShadow='0 10px 18px rgba(10, 0, 9, 0.22)'
												_hover={{
													bg: 'rgba(255, 255, 255, 0.08)',
													borderColor: 'pink.300',
												}}
												_focusVisible={{
													outline: '2px solid',
													outlineColor: 'pink.300',
													outlineOffset: '2px',
												}}
											>
												<NavLink to={immersiveUrl}>Immersive mode</NavLink>
											</Button>
										</Box>
									)}
									<Box textAlign='left'>
										<MarkdownRenderer content={poem.content} />
									</Box>
									{!isInteractionBlocked && (
										<Flex justify='flex-end' mt={6}>
											<PoemActions
												authClientId={authClientId}
												likedPoem={likedPoem}
												isSaved={isSaved}
												isUpdatingLike={isUpdatingLike}
												isSavingPoem={updatingSavedPoemId === poemId}
												onToggleLike={handleTogglePoemLike}
												onToggleSave={handleToggleSavePoem}
											/>
										</Flex>
									)}
								</Box>
							</Box>

							{!isInteractionBlocked && (
								<CommentsSection
									poemIsCommentable={poem.isCommentable}
									isAuthenticated={isAuthenticated}
									commentRestrictionMessage={commentRestrictionMessage}
									commentInput={commentInput}
									commentError={commentInputError}
									authClientId={authClientId}
									comments={comments}
									isLoadingComments={isLoadingComments}
									isCommentsError={isCommentsError}
									commentsError={commentsError}
									isCreatingComment={isCreatingComment}
									isDeletingComment={isDeletingComment}
									repliesByCommentId={repliesByCommentId}
									setRepliesByCommentId={setRepliesByCommentId}
									hasMoreComments={hasMoreComments}
									isLoadingMoreComments={isLoadingMoreComments}
									onLoadMoreComments={loadMoreComments}
									onCommentInputChange={handleCommentInputChange}
									onPublishComment={handlePublishComment}
									createComment={createComment}
									deleteComment={deleteComment}
									fetchReplies={fetchReplies}
									prefetchReplies={prefetchReplies}
								/>
							)}
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
						px={3.5}
						py={1.5}
						color='pink.100'
						border='1px solid'
						borderColor='purple.500'
						borderRadius='md'
						transition='all 0.2s ease'
						onClick={handleBack}
						_hover={{
							color: 'pink.50',
							borderColor: 'pink.400',
							bg: 'rgba(255, 255, 255, 0.06)',
						}}
					>
						<>
							<Icon as={ArrowLeftIcon} /> Back
						</>
					</Link>
				</Box>
			</Box>
		</Flex>
	);
}
