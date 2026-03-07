import { Flex } from '@chakra-ui/react';
import { PostCard } from '../components/PostCard';
import { PostGrid } from '../components/PostGrid';
import { useRecentPosts } from '../hooks/useRecentPosts';
import { AsyncState, Footer } from '@features/base';

export function HomePage() {
	const { posts, isError, isLoading } = useRecentPosts({ limit: 4 });
	return (
		<>
			<Flex as='main' layerStyle='main' direction='column'>
				<Flex as='section' direction='column' w='full' py='4'>
					<PostGrid>
						<AsyncState
							isLoading={isLoading}
							isError={isError}
							isEmpty={!posts || posts?.length === 0}
							emptyElement={<Flex textStyle='body'>No posts found</Flex>}
							errorElement={
								<Flex textStyle='body'>Error at loading posts</Flex>
							}
							loadingElement={<Flex textStyle='body'>Loading posts...</Flex>}
						>
							{posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</AsyncState>
					</PostGrid>
				</Flex>
			</Flex>
			<Footer
				links={[
					{ label: 'Home', to: '/' },
					{ label: 'Poems', to: '/poems' },
				]}
			></Footer>
		</>
	);
}
