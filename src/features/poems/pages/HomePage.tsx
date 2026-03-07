import { Flex } from '@chakra-ui/react';
import { PoemCard } from '../components/PoemCard';
import { PoemGrid } from '../components/PoemGrid';
import { useRecentPoems } from '../hooks/useRecentPoems';
import { AsyncState, Footer } from '@features/base';

export function HomePage() {
	const { poems, isError, isLoading } = useRecentPoems({ limit: 4 });
	return (
		<>
			<Flex as='main' layerStyle='main' direction='column'>
				<Flex as='section' direction='column' w='full' py='4'>
					<PoemGrid>
						<AsyncState
							isLoading={isLoading}
							isError={isError}
							isEmpty={!poems || poems?.length === 0}
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
							{poems.map((poem) => (
								<PoemCard key={poem.id} poem={poem} />
							))}
						</AsyncState>
					</PoemGrid>
				</Flex>
			</Flex>
			<Footer
				links={[
					{ label: 'Início', to: '/' },
					{ label: 'Poemas', to: '/poems' },
					{ label: 'Cadastrar', to: '/register' },
					{ label: 'Entrar', to: '/login' },
				]}
			></Footer>
		</>
	);
}
