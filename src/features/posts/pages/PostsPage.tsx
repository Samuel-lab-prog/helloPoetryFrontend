import { Flex, Heading, Button } from '@chakra-ui/react';
import { AsyncState, SelectField } from '@features/base';
import { PostCard } from '../components/PostCard';
import { PostGrid } from '../components/PostGrid';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { usePostsFilters } from '../hooks/usePostsFilters';
import { useTags } from '../hooks/useTags';

export function PostsPage() {
	const { control, tag, order } = usePostsFilters();
	const { tags, isLoading: isTagsLoading } = useTags();
	const {
		posts,
		isError,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfinitePosts({ tag: tag || undefined, order });

	const tagOptions: { value: string; label: string }[] = [
		{ value: '', label: 'Todas' },
		...tags.map((t) => ({ value: t.name, label: t.name })),
	];

	const orderOptions: { value: 'newest' | 'oldest'; label: string }[] = [
		{ value: 'newest', label: 'Mais recentes' },
		{ value: 'oldest', label: 'Mais antigos' },
	];

	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
		>
			<Flex
				as='section'
				mb={6}
				gap={8}
				direction='column'
				w='full'
			>
				<Heading
					as='h1'
					textStyle='h1'
				>
					Todas as Publicações
				</Heading>

				<Flex
					as='form'
					direction={['column', undefined, 'row']}
					gap={[4, undefined, 8]}
					w='full'
				>
					<SelectField
						label='Filtrar por tag'
						name='tag'
						disabled={isTagsLoading}
						control={control}
						options={tagOptions}
					/>

					<SelectField
						label='Ordenar por'
						name='order'
						control={control}
						options={orderOptions}
					/>
				</Flex>
			</Flex>

			<Flex
				as='section'
				w='full'
				direction='column'
				gap={4}
			>
				<AsyncState
					isError={isError}
					isEmpty={posts?.length === 0 && !isLoading}
					isLoading={isLoading}
					emptyElement={<Flex textStyle='body'>Nenhum post encontrado</Flex>}
					errorElement={<Flex textStyle='body'>Erro ao carregar posts</Flex>}
					loadingElement={<Flex textStyle='body'>Carregando posts...</Flex>}
				>
					<PostGrid>
						{posts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
							/>
						))}
					</PostGrid>
				</AsyncState>
			</Flex>

			<Flex justify={['end', 'end', 'end', 'center']}>
				{hasNextPage && (
					<Button
						onClick={() => fetchNextPage()}
						disabled={!hasNextPage}
						loading={isFetchingNextPage}
						mt={8}
						loadingText='Carregando...'
						alignSelf='center'
						variant='surface'
					>
						{isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
					</Button>
				)}
			</Flex>
		</Flex>
	);
}
