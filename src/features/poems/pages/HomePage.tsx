import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { AsyncState, Footer, Surface } from '@features/base';
import { PoemCard } from '../components/PoemCard';
import { PoemGrid } from '../components/PoemGrid';
import { useHomeFeed } from '../hooks/useHomeFeed';

function getAuthClientId() {
	try {
		const raw = localStorage.getItem('auth-client');
		if (!raw) return -1;
		const parsed = JSON.parse(raw) as { id?: number };
		return typeof parsed.id === 'number' && parsed.id > 0 ? parsed.id : -1;
	} catch {
		return -1;
	}
}

export function HomePage() {
	const authClientId = getAuthClientId();
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
			: 'Início'
		: 'Poemas recentes';

	const feedSubtitle = isAuthenticated
		? isPersonalizedFeed
			? 'Poemas de amigos e autores que você acompanha.'
			: 'Mostrando poemas mais recentes enquanto o feed personalizado não estiver disponível.'
		: 'Descubra novos textos publicados na comunidade.';

	return (
		<Flex direction='column' minH='100%'>
			<Flex as='main' layerStyle='main' direction='column' flex='1'>
				<VStack as='section' w='full' maxW='6xl' mx='auto' align='stretch' gap={{ base: 6, md: 8 }}>
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
							emptyElement={<Flex>Nenhum poema encontrado</Flex>}
							errorElement={<Flex>Erro ao carregar poemas</Flex>}
							loadingElement={<Flex>Nenhum poema encontrado</Flex>}
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
