import { Footer, SearchInput } from '@BaseComponents';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { getPoemsQueryPort } from '@core/ports/poems';
import { useIsAuthenticated } from '@features/auth/public/hooks/useIsAuthenticated';
import type { PaginatedPoemsType } from '@features/poems/public/types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { HomeFeed } from './components/HomeFeed';
import { useHomeFeed } from './hooks/useHomeFeed';
import { getFooterLinks } from './utils';
import { POEMS_FEED_LIMIT, POEMS_FEED_LIMIT_UNAUTHENTICATED } from './utils/constants';

export function HomePage() {
	const isAuthenticated = useIsAuthenticated();
	const [searchTitle, setSearchTitle] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const {
		poems: feedPoems,
		isError,
		isLoading,
	} = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? POEMS_FEED_LIMIT : POEMS_FEED_LIMIT_UNAUTHENTICATED,
	});
	const poemsQueryPort = getPoemsQueryPort();
	const isSearching = debouncedSearch.trim().length > 0;
	const searchQuery = useQuery<PaginatedPoemsType>({
		...poemsQueryPort.getSearchQueryOptions({
			limit: POEMS_FEED_LIMIT,
			searchTitle: debouncedSearch.trim() || undefined,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		}),
		enabled: isSearching,
	});

	const displayedPoems = isSearching ? (searchQuery.data?.poems ?? []) : feedPoems;
	const isFeedLoading = isSearching ? searchQuery.isLoading : isLoading;
	const isFeedError = isSearching ? searchQuery.isError : isError;

	return (
		<Flex direction='column' minH='100%'>
			<Flex
				as='main'
				layerStyle='main'
				direction='column'
				align='center'
				py={12}
				px={[4, 4, 0]}
				flex='1'
				w='full'
				maxW='2xl'
				mx='auto'
			>
				<VStack as='section' w='full' align='stretch' gap={{ base: 0 }}>
					<Box p={4}>
						<SearchInput
							label='Search poems'
							value={searchTitle}
							onValueChange={setSearchTitle}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by title'
						/>
					</Box>

					<HomeFeed poems={displayedPoems} isLoading={isFeedLoading} isError={isFeedError} />
				</VStack>
			</Flex>

			<Footer links={getFooterLinks(isAuthenticated)} />
		</Flex>
	);
}
