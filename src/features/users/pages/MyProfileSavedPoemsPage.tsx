import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { useSavedPoems } from '@features/poems';
import { ProfileAccessGate } from '../components/my-profile/ProfileAccessGate';
import { SavedPoemsSection } from '../components/my-profile/SavedPoemsSection';

export function MyProfileSavedPoemsPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const { savedPoems, isLoadingSavedPoems } = useSavedPoems(Boolean(authClient?.id));

	if (!authClient?.id) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex
					mb={8}
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					direction={{ base: 'column', md: 'row' }}
					gap={3}
				>
					<Heading as='h1' textStyle='h2'>
						Todos os poemas salvos
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>Voltar ao perfil</NavLink>
					</Button>
				</Flex>

				<SavedPoemsSection savedPoems={savedPoems} isLoadingSavedPoems={isLoadingSavedPoems} />
			</Box>
		</Flex>
	);
}
