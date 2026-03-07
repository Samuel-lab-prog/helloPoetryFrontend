/* eslint-disable max-lines-per-function */
import { NavLink } from 'react-router-dom';
import {
	Badge,
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	HStack,
	Text,
	VStack,
} from '@chakra-ui/react';
import { AsyncState } from '@features/base';
import { useMyProfile } from '../hooks/useMyProfile';
import { useFriendRequestActions, useSavedPoems } from '@features/interactions';

export function MyProfilePage() {
	const { profile, isLoading, isError, isMissingClient } = useMyProfile();
	const {
		acceptRequest,
		rejectRequest,
		isAccepting,
		isRejecting,
		errorMessage,
	} = useFriendRequestActions();
	const { savedPoems, isLoadingSavedPoems } = useSavedPoems(!isMissingClient);

	if (isMissingClient) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<Box
					w='full'
					maxW='2xl'
					p={{ base: 6, md: 8 }}
					border='1px solid'
					borderColor='purple.700'
					borderRadius='2xl'
					bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
				>
					<VStack align='start' gap={4}>
						<Badge colorPalette='pink' variant='subtle'>
							Perfil
						</Badge>
						<Heading as='h1' textStyle='h2'>
							Entre para ver seu perfil
						</Heading>
						<Text textStyle='body' color='pink.100'>
							Acompanhe poemas salvos, pedidos de amizade e suas estatisticas em
							um unico lugar.
						</Text>
						<HStack gap={3} wrap='wrap'>
							<Button
								size={{ base: 'sm', md: 'md' }}
								variant='solidPink'
								asChild
							>
								<NavLink to='/login'>Entrar</NavLink>
							</Button>
							<Button
								size={{ base: 'sm', md: 'md' }}
								variant='solidPink'
								colorPalette='gray'
								asChild
							>
								<NavLink to='/register'>Criar conta</NavLink>
							</Button>
						</HStack>
					</VStack>
				</Box>
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Heading as='h1' textStyle='h1' mb={8}>
					Meu Perfil
				</Heading>

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={!profile}
					loadingElement={<Text textStyle='body'>Carregando perfil...</Text>}
					errorElement={<Text textStyle='body'>Erro ao carregar perfil.</Text>}
					emptyElement={<Text textStyle='body'>Perfil não encontrado.</Text>}
				>
					{profile && (
						<Flex direction='column' gap={6}>
							<Box
								p={{ base: 5, md: 6 }}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='2xl'
								bg='linear-gradient(145deg, rgba(122,19,66,0.18) 0%, rgba(27,0,25,0.34) 100%)'
								backdropFilter='blur(4px)'
							>
								<VStack align='start' gap={2}>
									<Text textStyle='h3'>{profile.name}</Text>
									<Text textStyle='small' color='pink.200'>
										@{profile.nickname}
									</Text>
									<Text textStyle='small' color='pink.100'>
										{profile.email}
									</Text>
									<Text textStyle='body'>{profile.bio || 'Sem bio.'}</Text>
								</VStack>
							</Box>

							<Grid
								templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
								gap={4}
							>
								<Box
									p={4}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='xl'
									bg='rgba(255, 255, 255, 0.02)'
								>
									<Text textStyle='smaller' color='pink.200'>
										Poemas
									</Text>
									<Text textStyle='h3'>{profile.stats.poemsIds.length}</Text>
								</Box>
								<Box
									p={4}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='xl'
									bg='rgba(255, 255, 255, 0.02)'
								>
									<Text textStyle='smaller' color='pink.200'>
										Comentários
									</Text>
									<Text textStyle='h3'>{profile.stats.commentsIds.length}</Text>
								</Box>
								<Box
									p={4}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='xl'
									bg='rgba(255, 255, 255, 0.02)'
								>
									<Text textStyle='smaller' color='pink.200'>
										Amigos
									</Text>
									<Text textStyle='h3'>{profile.stats.friendsIds.length}</Text>
								</Box>
							</Grid>

							<Box
								p={5}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='xl'
								bg='rgba(255, 255, 255, 0.02)'
							>
								<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
									Solicitações de amizade recebidas
								</Heading>

								<Flex direction='column' gap={3}>
									{profile.friendshipRequestsReceived.length === 0 && (
										<Text textStyle='small'>Nenhuma solicitação pendente.</Text>
									)}

									{profile.friendshipRequestsReceived.map((request) => (
										<Flex
											key={request.requesterId}
											align={{ base: 'start', md: 'center' }}
											justify='space-between'
											direction={{ base: 'column', md: 'row' }}
											gap={3}
											p={3}
											border='1px solid'
											borderColor='purple.700'
											borderRadius='md'
										>
											<Text textStyle='small'>
												@{request.requesterNickname}
											</Text>
											<Flex gap={2}>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													onClick={() => acceptRequest(request.requesterId)}
													loading={isAccepting}
												>
													Aceitar
												</Button>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													colorPalette='gray'
													onClick={() => rejectRequest(request.requesterId)}
													loading={isRejecting}
												>
													Recusar
												</Button>
											</Flex>
										</Flex>
									))}
								</Flex>

								{errorMessage && (
									<Text mt={3} textStyle='small' color='red.400'>
										{errorMessage}
									</Text>
								)}
							</Box>

							<Box
								p={5}
								border='1px solid'
								borderColor='purple.700'
								borderRadius='xl'
								bg='rgba(255, 255, 255, 0.02)'
							>
								<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
									Poemas salvos
								</Heading>

								<Flex direction='column' gap={3}>
									{isLoadingSavedPoems && (
										<Text textStyle='small'>Carregando poemas salvos...</Text>
									)}

									{!isLoadingSavedPoems && savedPoems.length === 0 && (
										<Text textStyle='small'>Você ainda não salvou poemas.</Text>
									)}

									{savedPoems.map((poem) => (
										<Flex
											key={poem.id}
											align={{ base: 'start', md: 'center' }}
											justify='space-between'
											direction={{ base: 'column', md: 'row' }}
											gap={3}
											p={3}
											border='1px solid'
											borderColor='purple.700'
											borderRadius='md'
										>
											<Text textStyle='small'>{poem.title}</Text>
											<Button
												size={{ base: 'xs', md: 'sm' }}
												variant='solidPink'
												asChild
											>
												<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
													Abrir
												</NavLink>
											</Button>
										</Flex>
									))}
								</Flex>
							</Box>
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}
