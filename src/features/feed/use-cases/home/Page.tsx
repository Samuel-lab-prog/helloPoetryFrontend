import { Footer, SearchInput } from '@BaseComponents';
import { Flex, VStack } from '@chakra-ui/react';
import { useIsAuthenticated } from '@features/auth/public/hooks/useIsAuthenticated';
import { poems } from '@features/poems/api/endpoints';
import type { PaginatedPoems } from '@features/poems/api/types';
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
	const isSearching = debouncedSearch.trim().length > 0;
	const searchQuery = useQuery<PaginatedPoems>({
		...poems.getPoems.query({
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
				flex='1'
				w='full'
				maxW='4xl'
				mx='auto'
				px={{ base: 4, md: 6 }}
			>
				<VStack as='section' w='full' align='stretch' gap={{ base: 6, md: 8 }}>
					<SearchInput
						label='Search poems'
						value={searchTitle}
						onValueChange={setSearchTitle}
						onDebouncedChange={setDebouncedSearch}
						placeholder='Search by title'
					/>

					<HomeFeed
						poems={displayedPoems}
						isLoading={isFeedLoading}
						isError={isFeedError}
						templateColumns='1fr'
					/>
				</VStack>
			</Flex>

			<Footer links={getFooterLinks(isAuthenticated)} />
		</Flex>
	);
}
