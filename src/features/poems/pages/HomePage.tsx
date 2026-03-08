import { useMemo } from 'react';
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { AsyncState, Footer } from '@features/base';
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

	const footerLinks = useMemo(
		() => [
			{ label: 'Inicio', to: '/' },
			{ label: 'Poemas', to: '/poems' },
			...(isAuthenticated
				? [
						{ label: 'Criar poema', to: '/poems/new' },
						{ label: 'Meu perfil', to: '/my-profile' },
					]
				: [
						{ label: 'Cadastrar', to: '/register' },
						{ label: 'Entrar', to: '/login' },
					]),
		],
		[isAuthenticated],
	);

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
		<Flex
			direction='column'
			minH='100%'
		>
			<Flex
				as='main'
				layerStyle='main'
				direction='column'
				flex='1'
			>
				<VStack
					as='section'
					w='full'
					maxW='6xl'
					mx='auto'
					align='stretch'
					gap={{ base: 6, md: 8 }}
				>
					<Box
						border='1px solid'
						borderColor='purple.700'
						borderRadius='2xl'
						px={{ base: 4, md: 6 }}
						py={{ base: 5, md: 7 }}
						bg='linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
					>
						<VStack
							align='start'
							gap={2}
						>
							<Heading
								as='h1'
								textStyle='h2'
							>
								{feedTitle}
							</Heading>
							<Text
								textStyle='lead'
								color='pink.200'
							>
								{feedSubtitle}
							</Text>
						</VStack>
					</Box>

					<Box>
						<AsyncState
							isLoading={isLoading}
							isError={isError}
							isEmpty={!poems || poems.length === 0}
							emptyElement={
								<Flex textStyle='body'>Nenhum poema encontrado</Flex>
							}
							errorElement={
								<Flex textStyle='body'>Erro ao carregar poemas</Flex>
							}
							loadingElement={
								<Flex textStyle='body'>Carregando poemas...</Flex>
							}
						>
							<PoemGrid>
								{poems.map((poem) => (
									<PoemCard
										key={poem.id}
										poem={poem}
									/>
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
