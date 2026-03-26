import { Avatar, Box, Button, Flex, Grid, Heading, Icon, Text } from '@chakra-ui/react';
import { Clock3, LogIn, UserCheck, UserPlus, UserX } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AsyncState } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { useSendFriendRequest } from '@features/interactions';
import { PoemCard } from '@root/features/poems/public/components/PoemCard';
import { useAuthorProfile } from '../hooks/useAuthorProfile';
import { useAuthorPoems } from '../../poems/public/hooks/useGetAuthorPoems';
import type { FullPoemType, PoemPreviewType } from '../../poems/types';

function toPreviewPoem(poem: FullPoemType): PoemPreviewType {
	return {
		id: poem.id,
		title: poem.title,
		slug: poem.slug,
		createdAt: poem.createdAt,
		likesCount: poem.stats?.likesCount,
		tags: poem.tags,
		author: poem.author,
	};
}

export function AuthorPage() {
	const { id } = useParams<{ id: string }>();
	const authorId = Number(id);
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);

	const { author, isLoading: isAuthorLoading, isError: isAuthorError } = useAuthorProfile(authorId);
	const { poems, isLoading: isPoemasLoading, isError: isPoemasError } = useAuthorPoems(authorId);
	const { sendFriendRequest, isSending, isSuccess, errorMessage, reset } = useSendFriendRequest();

	useEffect(() => {
		reset();
	}, [authorId, reset]);

	const isAuthenticated = authClientId > 0;
	const isSelf = !!author && author.id === authClientId;
	const hasOutgoingRequest = !!author && (author.isFriendRequester || isSuccess);
	const hasIncomingRequest = !!author && author.hasIncomingFriendRequest;

	const canSendFriendRequest =
		!!author &&
		isAuthenticated &&
		!isSelf &&
		!author.isFriend &&
		!author.hasBlockedRequester &&
		!author.isBlockedByRequester &&
		!hasOutgoingRequest &&
		!hasIncomingRequest;

	const relationStatus = (() => {
		if (!author) return null;
		if (!isAuthenticated)
			return { icon: LogIn, color: 'pink.200', text: 'Sign in to send a request.' };
		if (isSelf) return null;
		if (author.hasBlockedRequester)
			return { icon: UserX, color: 'red.300', text: 'You were blocked by this user.' };
		if (author.isBlockedByRequester)
			return { icon: UserX, color: 'red.300', text: 'You blocked this user.' };
		if (author.isFriend) return { icon: UserCheck, color: 'green.300', text: 'You are friends.' };
		if (hasOutgoingRequest) return { icon: Clock3, color: 'yellow.300', text: 'Request sent.' };
		if (hasIncomingRequest)
			return { icon: UserPlus, color: 'yellow.300', text: 'Request received.' };
		return null;
	})();

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center' gap={8}>
			<Box w='full' maxW='4xl'>
				{!isValidAuthorId ? (
					<Text textStyle='body'>Invalid author.</Text>
				) : (
					<AsyncState
						isLoading={isAuthorLoading}
						isError={isAuthorError}
						isEmpty={!author}
						loadingElement={<Text textStyle='body'>Loading author...</Text>}
						errorElement={<Text textStyle='body'>Error loading author.</Text>}
						emptyElement={<Text textStyle='body'>Author not found.</Text>}
					>
						{author && (
							<Flex
								p={6}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='xl'
								bg='rgba(255, 255, 255, 0.02)'
								backdropFilter='blur(4px)'
								gap={6}
								align={{ base: 'start', md: 'center' }}
								direction={{ base: 'column', md: 'row' }}
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay='30ms'
							>
								<Avatar.Root
									size='2xl'
									w={{ base: '6rem', md: '8rem' }}
									h={{ base: '6rem', md: '8rem' }}
								>
									<Avatar.Image src={author.avatarUrl ?? undefined} />
									<Avatar.Fallback name={author.name} />
								</Avatar.Root>

								<Flex direction='column' gap={1}>
									<Heading as='h1' textStyle='h2'>
										{author.name}
									</Heading>
									<Text textStyle='small' color='pink.200'>
										@{author.nickname}
									</Text>
									<Text textStyle='small'>{author.bio || 'No bio'}</Text>
									<Text textStyle='smaller' color='pink.200'>
										Poems: {author.stats.poemsCount} | Comments: {author.stats.commentsCount} |
										Friends: {author.stats.friendsCount}
									</Text>

									<Flex mt={2} direction='column' gap={2} align='start'>
										{relationStatus && (
											<Flex align='center' gap={2}>
												<Icon as={relationStatus.icon} boxSize={4.5} color={relationStatus.color} />
												<Text textStyle='smaller' color={relationStatus.color}>
													{relationStatus.text}
												</Text>
											</Flex>
										)}

										{canSendFriendRequest && (
											<Button
												size='sm'
												variant='solidPink'
												onClick={() => sendFriendRequest(author.id)}
												loading={isSending}
											>
												Send friend request
											</Button>
										)}

										{errorMessage && (
											<Text textStyle='smaller' color='red.400'>
												{errorMessage}
											</Text>
										)}
									</Flex>
								</Flex>
							</Flex>
						)}
					</AsyncState>
				)}
			</Box>

			<Box w='full' maxW='4xl'>
				<Flex align='center' justify='space-between' gap={3} mb={4} wrap='wrap'>
					<Heading as='h2' textStyle='h3'>
						Author poems
					</Heading>
					<Text textStyle='small' color='pink.200'>
						{poems.length} {poems.length === 1 ? 'poem' : 'poems'}
					</Text>
				</Flex>

				<AsyncState
					isLoading={isPoemasLoading}
					isError={isPoemasError}
					isEmpty={poems.length === 0}
					loadingElement={
						<Flex
							p={6}
							border='1px solid'
							borderColor='purple.700'
							borderRadius='xl'
							bg='rgba(255, 255, 255, 0.02)'
						>
							<Text textStyle='body'>Loading poems...</Text>
						</Flex>
					}
					errorElement={
						<Flex
							p={6}
							border='1px solid'
							borderColor='purple.700'
							borderRadius='xl'
							bg='rgba(255, 255, 255, 0.02)'
						>
							<Text textStyle='body'>Error loading poems.</Text>
						</Flex>
					}
					emptyElement={
						<Flex
							p={6}
							border='1px solid'
							borderColor='purple.700'
							borderRadius='xl'
							bg='rgba(255, 255, 255, 0.02)'
						>
							<Text textStyle='body'>No poems published.</Text>
						</Flex>
					}
				>
					<Grid
						w='full'
						templateColumns={{ base: '1fr', lg: '1fr 1fr', xl: '1fr 1fr 1fr' }}
						gap={3}
					>
						{poems.map((poem, index) => (
							<Box
								key={poem.id}
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay={`${30 + index * 30}ms`}
							>
								<PoemCard poem={toPreviewPoem(poem)} hideAuthorMeta />
							</Box>
						))}
					</Grid>
				</AsyncState>
			</Box>
		</Flex>
	);
}
