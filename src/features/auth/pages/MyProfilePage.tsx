import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { AsyncState } from '@features/base';
import { useMyProfile } from '../hooks/useMyProfile';
import { useFriendRequestActions, useSavedPoems } from '@features/interactions';

export function MyProfilePage() {
	const { profile, isLoading, isError, isMissingClient } = useMyProfile();
	const { acceptRequest, rejectRequest, isAccepting, isRejecting, errorMessage } =
		useFriendRequestActions();
	const { savedPoems, isLoadingSavedPoems } = useSavedPoems(!isMissingClient);

	if (isMissingClient) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<Text textStyle='body'>Faca login para ver seu perfil.</Text>
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='4xl'>
				<Heading as='h1' textStyle='h1' mb={8}>
					My Profile
				</Heading>

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={!profile}
					loadingElement={<Text textStyle='body'>Carregando perfil...</Text>}
					errorElement={<Text textStyle='body'>Erro ao carregar perfil.</Text>}
					emptyElement={<Text textStyle='body'>Perfil nao encontrado.</Text>}
				>
					{profile && (
						<Flex
							direction='column'
							gap={4}
							p={6}
							border='1px solid'
							borderColor='purple.700'
							borderRadius='xl'
							bg='rgba(255, 255, 255, 0.02)'
							backdropFilter='blur(4px)'
						>
							<Text textStyle='h3'>{profile.name}</Text>
							<Text textStyle='small' color='pink.200'>
								@{profile.nickname}
							</Text>
							<Text textStyle='small'>{profile.email}</Text>
							<Text textStyle='body'>{profile.bio || 'Sem bio.'}</Text>

							<Flex gap={6} wrap='wrap' mt={2}>
								<Text textStyle='small'>
									Poemas: {profile.stats.poemsIds.length}
								</Text>
								<Text textStyle='small'>
									Comentarios: {profile.stats.commentsIds.length}
								</Text>
								<Text textStyle='small'>
									Amigos: {profile.stats.friendsIds.length}
								</Text>
							</Flex>

							<Flex direction='column' gap={3} mt={4}>
								<Heading as='h2' textStyle='h4'>
									Solicitacoes de amizade recebidas
								</Heading>

								{profile.friendshipRequestsReceived.length === 0 && (
									<Text textStyle='small'>Nenhuma solicitacao pendente.</Text>
								)}

								{profile.friendshipRequestsReceived.map((request) => (
									<Flex
										key={request.requesterId}
										align='center'
										justify='space-between'
										gap={4}
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
												size='sm'
												variant='surface'
												onClick={() => acceptRequest(request.requesterId)}
												loading={isAccepting}
											>
												Aceitar
											</Button>
											<Button
												size='sm'
												variant='surface'
												colorPalette='gray'
												onClick={() => rejectRequest(request.requesterId)}
												loading={isRejecting}
											>
												Recusar
											</Button>
										</Flex>
									</Flex>
								))}

								{errorMessage && (
									<Text textStyle='small' color='red.400'>
										{errorMessage}
									</Text>
								)}
							</Flex>

							<Flex direction='column' gap={3} mt={4}>
								<Heading as='h2' textStyle='h4'>
									Poemas salvos
								</Heading>

								{isLoadingSavedPoems && (
									<Text textStyle='small'>Carregando poemas salvos...</Text>
								)}

								{!isLoadingSavedPoems && savedPoems.length === 0 && (
									<Text textStyle='small'>Voce ainda nao salvou poemas.</Text>
								)}

								{savedPoems.map((poem) => (
									<Flex
										key={poem.id}
										align='center'
										justify='space-between'
										gap={4}
										p={3}
										border='1px solid'
										borderColor='purple.700'
										borderRadius='md'
									>
										<Text textStyle='small'>{poem.title}</Text>
										<Button size='sm' variant='surface' asChild>
											<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
												Abrir
											</NavLink>
										</Button>
									</Flex>
								))}
							</Flex>
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}
