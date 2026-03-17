import { Flex } from '@chakra-ui/react';
import { PoemsFilters } from './components/PoemsFilters';
import { PoemsGrid } from './components/PoemsGrid';
import { PoemsLoadMore } from './components/PoemsLoadMore';
import { useInfinitePoems } from './hooks/useInfinitePoems';
import { usePoemsFilters } from './hooks/usePoemsFilters';

export function PoemsPage() {
	const filters = usePoemsFilters();
	const { poems, isError, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfinitePoems({
			order: filters.order,
			tags: filters.tags,
			searchTitle: filters.searchTitle,
		});

	return (
		<Flex as='main' layerStyle='main' direction='column'>
			<PoemsFilters filters={filters} />
			<PoemsGrid poems={poems} isLoading={isLoading} isError={isError} />
			<PoemsLoadMore
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onLoadMore={() => fetchNextPage()}
			/>
		</Flex>
	);
}
