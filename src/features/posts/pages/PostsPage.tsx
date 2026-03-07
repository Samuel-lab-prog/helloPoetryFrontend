import { Flex, Heading, Button } from '@chakra-ui/react';
import { AsyncState, SelectField } from '@features/base';
import { PoemCard } from '../components/PoemCard';
import { PostGrid } from '../components/PostGrid';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { usePostsFilters } from '../hooks/usePostsFilters';

export function PostsPage() {
	const { control, order } = usePostsFilters();
	const {
		poems,
		isError,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfinitePosts({ order });

	const orderOptions: { value: 'newest' | 'oldest'; label: string }[] = [
		{ value: 'newest', label: 'Mais recentes' },
		{ value: 'oldest', label: 'Mais antigos' },
	];

	return (
		<Flex as='main' layerStyle='main' direction='column'>
			<Flex as='section' mb={6} gap={8} direction='column' w='full'>
				<Heading as='h1' textStyle='h1'>
					Todos os Poemas
				</Heading>

				<Flex
					as='form'
					direction={['column', undefined, 'row']}
					gap={[4, undefined, 8]}
					w='full'
				>
					<SelectField
						label='Ordenar por'
						name='order'
						control={control}
						options={orderOptions}
					/>
				</Flex>
			</Flex>

			<Flex as='section' w='full' direction='column' gap={4}>
				<AsyncState
					isError={isError}
					isEmpty={poems?.length === 0 && !isLoading}
					isLoading={isLoading}
					emptyElement={<Flex textStyle='body'>Nenhum poema encontrado</Flex>}
					errorElement={<Flex textStyle='body'>Erro ao carregar poemas</Flex>}
					loadingElement={<Flex textStyle='body'>Carregando poemas...</Flex>}
				>
					<PostGrid>
						{poems.map((poem) => (
							<PoemCard key={poem.id} poem={poem} />
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
