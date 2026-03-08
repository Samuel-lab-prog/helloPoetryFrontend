import { Avatar, Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink, useParams } from 'react-router-dom';
import { AsyncState } from '@features/base';
import { useAuthClientStore } from '@features/auth';
import { useSendFriendRequest } from '@features/interactions';
import { useAuthorProfile } from '../hooks/useAuthorProfile';
import { useAuthorPoems } from '../../poems/hooks/useAuthorPoems';

export function AuthorPage() {
	const { id } = useParams<{ id: string }>();
	const authorId = Number(id);
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);

	const { author, isLoading: isAuthorLoading, isError: isAuthorError } = useAuthorProfile(authorId);
	const { poems, isLoading: isPoemasLoading, isError: isPoemasError } = useAuthorPoems(authorId);
	const { sendFriendRequest, isSending, isSuccess, errorMessage } = useSendFriendRequest();

	const canSendFriendRequest =
		!!author &&
		authClientId > 0 &&
		author.id !== authClientId &&
		!author.isFriend &&
		!author.hasBlockedRequester &&
		!author.isBlockedByRequester;

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center' gap={8}>
			<Box w='full' maxW='4xl'>
				{!isValidAuthorId ? (
					<Text textStyle='body'>Autor invalido.</Text>
				) : (
					<AsyncState
						isLoading={isAuthorLoading}
						isError={isAuthorError}
						isEmpty={!author}
						loadingElement={<Text textStyle='body'>Carregando autor...</Text>}
						errorElement={<Text textStyle='body'>Erro ao carregar autor.</Text>}
						emptyElement={<Text textStyle='body'>Autor nao encontrado.</Text>}
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
									<Text textStyle='small'>{author.bio || 'Sem bio'}</Text>
									<Text textStyle='smaller' color='pink.200'>
										Poemas: {author.stats.poemsCount} | Comentarios: {author.stats.commentsCount} |
										Amigos: {author.stats.friendsCount}
									</Text>

									{canSendFriendRequest && (
										<Flex mt={2} direction='column' gap={2} align='start'>
											<Button
												size='sm'
												variant='solidPink'
												onClick={() => sendFriendRequest(author.id)}
												loading={isSending}
												disabled={isSuccess}
											>
												{isSuccess ? 'Pedido enviado' : 'Enviar pedido de amizade'}
											</Button>
											{errorMessage && (
												<Text textStyle='smaller' color='red.400'>
													{errorMessage}
												</Text>
											)}
										</Flex>
									)}
								</Flex>
							</Flex>
						)}
					</AsyncState>
				)}
			</Box>

			<Box w='full' maxW='4xl'>
				<Heading as='h2' textStyle='h3' mb={4}>
					Poemas do autor
				</Heading>

				<AsyncState
					isLoading={isPoemasLoading}
					isError={isPoemasError}
					isEmpty={poems.length === 0}
					loadingElement={<Text textStyle='body'>Carregando poemas...</Text>}
					errorElement={<Text textStyle='body'>Erro ao carregar poemas.</Text>}
					emptyElement={<Text textStyle='body'>Sem poemas publicados.</Text>}
				>
					<Flex direction='column' gap={3}>
						{poems.map((poem) => (
							<Box
								key={poem.id}
								p={4}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='lg'
								bg='rgba(255, 255, 255, 0.02)'
							>
								<Heading as='h3' textStyle='h4' mb={2}>
									{poem.title}
								</Heading>
								<Text textStyle='small' mb={3}>
									{poem.excerpt}
								</Text>
								<Link asChild textStyle='small' color='pink.100'>
									<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Abrir poema</NavLink>
								</Link>
							</Box>
						))}
					</Flex>
				</AsyncState>
			</Box>
		</Flex>
	);
}
