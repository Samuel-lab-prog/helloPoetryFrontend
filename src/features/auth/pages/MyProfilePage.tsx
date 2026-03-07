import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { AsyncState } from '@features/base';
import { useMyProfile } from '../hooks/useMyProfile';

export function MyProfilePage() {
	const { profile, isLoading, isError, isMissingClient } = useMyProfile();

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
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}
