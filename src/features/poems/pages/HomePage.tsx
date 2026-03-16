import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { AsyncState, Footer, Surface } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { PoemCard } from '../components/PoemCard';
import { PoemGrid } from '../components/PoemGrid';
import { useHomeFeed } from '../hooks/useHomeFeed';

export function HomePage() {
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);
	const isAuthenticated = authClientId > 0;
	const { poems, isError, isLoading, isPersonalizedFeed } = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? 8 : 4,
	});

	function generateFooterLinks(isAuthenticated: boolean) {
		const links = [
			{ label: 'Inicio', to: '/' },
			{ label: 'Poemas', to: '/poems' },
		];
		if (isAuthenticated) {
			links.push({ label: 'Criar poema', to: '/poems/new' });
			links.push({ label: 'Meu perfil', to: '/my-profile' });
		} else {
			links.push({ label: 'Cadastrar', to: '/register' });
			links.push({ label: 'Entrar', to: '/login' });
		}
		return links;
	}

	const footerLinks = generateFooterLinks(isAuthenticated);

	const feedTitle = isAuthenticated
		? isPersonalizedFeed
			? 'Seu feed'
			: 'Inicio'
		: 'Poemas recentes';

	const feedSubtitle = isAuthenticated
		? isPersonalizedFeed
			? 'Poemas de amigos e autores que voce acompanha.'
			: 'Mostrando poemas mais recentes enquanto o feed personalizado nao estiver disponivel.'
		: 'Descubra novos textos publicados na comunidade.';

	return (
		<Flex direction='column' minH='100%'>
			<Flex as='main' layerStyle='main' direction='column' flex='1'>
				<VStack as='section' w='full' align='stretch' gap={{ base: 6, md: 8 }}>
					<Surface>
						<VStack align='start' gap={2}>
							<Heading as='h1' textStyle='h2'>
								{feedTitle}
							</Heading>
							<Text color='pink.200'>{feedSubtitle}</Text>
						</VStack>
					</Surface>

					<Box>
						<AsyncState
							isLoading={isLoading}
							isError={isError}
							isEmpty={!poems || poems.length === 0}
						>
							<PoemGrid>
								{poems.map((poem) => (
									<PoemCard key={poem.id} poem={poem} />
								))}
							</PoemGrid>
						</AsyncState>
					</Box>
				</VStack>
			</Flex>

			<Footer links={footerLinks} />
		</Flex>
	);
}
