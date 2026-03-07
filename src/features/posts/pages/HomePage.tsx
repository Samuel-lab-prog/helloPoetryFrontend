import { Flex, Heading, Text } from '@chakra-ui/react';
import { PostCard } from '../components/PostCard';
import { PostGrid } from '../components/PostGrid';
import { useRecentPosts } from '../hooks/useRecentPosts';
import { AsyncState, Footer } from '@features/base';

export function HomePage() {
	const { posts, isError, isLoading } = useRecentPosts({ limit: 4 });
	return (
		<>
			<Flex
				as='main'
				layerStyle='main'
				direction='column'
			>
				<Flex
					as='section'
					direction='column'
					w='full'
					gap={2}
					pb={4}
				>
					<Heading
						as='h1'
						textStyle='h1'
					>
						Bem-vindo(a) ao Samuel's Blog!
					</Heading>
					<Text textStyle='body'>
						Neste blog, você encontrará muitas citações interessantes de um
						indivíduo chamado Samuel Gomes.
					</Text>
				</Flex>
				<Flex
					as='section'
					direction='column'
					w='full'
					py={4}
				>
					<Heading
						as='h2'
						textStyle='h2'
						mb={2}
					>
						Últimas Publicações
					</Heading>
					<PostGrid>
						<AsyncState
							isLoading={isLoading}
							isError={isError}
							isEmpty={!posts || posts?.length === 0}
							emptyElement={
								<Flex textStyle='body'>Nenhum post encontrado</Flex>
							}
							errorElement={
								<Flex textStyle='body'>Erro ao carregar posts</Flex>
							}
							loadingElement={<Flex textStyle='body'>Carregando posts...</Flex>}
						>
							{posts.map((post) => (
								<PostCard
									key={post.id}
									post={post}
								/>
							))}
						</AsyncState>
					</PostGrid>
				</Flex>
				<Flex
					as='section'
					direction='column'
					w='full'
					justifyContent='end'
					py={4}
				>
					<Heading
						as='h2'
						textStyle='h2'
						mb={2}
						w='full'
					>
						Sobre mim
					</Heading>
					<Text
						textStyle='body'
						maxW={['100%', undefined, undefined, '80%']}
						mb={4}
					>
						Samuel Gomes, é um desenvolvedor de software, entusiasta de
						tecnologia e amante de boas citações. Mas ele faz mais coisas
						também: música, literatura, arte...
					</Text>
					<Text
						textStyle='body'
						maxW={['100%', undefined, undefined, '80%']}
					>
						Este blog é um espaço onde compartilho minhas citações favoritas,
						pensamentos e reflexões sobre diversos temas. Espero que você
						encontre inspiração e conhecimento aqui!
					</Text>
					<Flex
						display='flex'
						justifyContent={['end', undefined, undefined, 'start']}
						alignItems='center'
					></Flex>
				</Flex>
			</Flex>
			<Footer
				links={[
					{ label: 'Home', to: '/' },
					{ label: 'Posts', to: '/posts' },
				]}
			></Footer>
		</>
	);
}
