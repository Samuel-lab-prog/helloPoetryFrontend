import { Flex } from '@chakra-ui/react';
import { PoemCard } from '../components/PoemCard';
import { PostGrid } from '../components/PostGrid';
import { useRecentPosts } from '../hooks/useRecentPosts';
import { AsyncState, Footer } from '@features/base';

export function HomePage() {
	const { poems, isError, isLoading } = useRecentPosts({ limit: 4 });
	return (
		<>
			<Flex as='main' layerStyle='main' direction='column'>
				<Flex as='section' direction='column' w='full' py='4'>
					<PostGrid>
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
					</PostGrid>
				</Flex>
			</Flex>
			<Footer
				links={[
					{ label: 'Home', to: '/' },
					{ label: 'Poems', to: '/poems' },
					{ label: 'Register', to: '/register' },
					{ label: 'Login', to: '/login' },
				]}
			></Footer>
		</>
	);
}
