import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { AsyncState, Footer, Surface } from '@root/core/base';
import { PoemCard } from '../components/PoemCard';
import { PoemGrid } from '../components/PoemGrid';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { useIsAuthenticated } from '@root/core/hooks/useIsAuthenticated';

const POEMS_FEED_LIMIT = 8;
const POEMS_FEED_LIMIT_UNAUTHENTICATED = 4;

export function HomePage() {
	const isAuthenticated = useIsAuthenticated();
	const { poems, isError, isLoading, isPersonalizedFeed } = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? POEMS_FEED_LIMIT : POEMS_FEED_LIMIT_UNAUTHENTICATED,
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

	function generatePageTitle(isAuthenticated: boolean, isPersonalizedFeed: boolean) {
		if (!isAuthenticated) return 'Poemas recentes';
		return isPersonalizedFeed ? 'Seu feed' : 'Inicio';
	}

	function generatePageSubtitle(isAuthenticated: boolean, isPersonalizedFeed: boolean) {
		if (!isAuthenticated) return 'Descubra novos textos publicados na comunidade.';
		return isPersonalizedFeed
			? 'Poemas de amigos e autores que voce acompanha.'
			: 'Mostrando poemas mais recentes enquanto o feed personalizado nao estiver disponivel.';
	}

	function PageHeader() {
		return (
			<Surface>
				<VStack align='start' gap={2}>
					<Heading as='h1' textStyle='h2'>
						{generatePageTitle(isAuthenticated, isPersonalizedFeed)}
					</Heading>
					<Text color='pink.200'>{generatePageSubtitle(isAuthenticated, isPersonalizedFeed)}</Text>
				</VStack>
			</Surface>
		);
	}

	return (
		<Flex direction='column' minH='100%'>
			<Flex as='main' layerStyle='main' direction='column' flex='1'>
				<VStack as='section' w='full' align='stretch' gap={{ base: 6, md: 8 }}>
					<PageHeader />

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

			<Footer links={generateFooterLinks(isAuthenticated)} />
		</Flex>
	);
}
