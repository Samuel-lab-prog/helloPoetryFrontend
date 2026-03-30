import { Field, Flex, Input, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Footer } from '@root/core/base';
import { api } from '@root/core/api';
import { useIsAuthenticated } from '@root/core/hooks/useIsAuthenticated';
import { HomeFeed } from './components/HomeFeed';
import { POEMS_FEED_LIMIT, POEMS_FEED_LIMIT_UNAUTHENTICATED } from './constants';
import { useHomeFeed } from './hooks/useHomeFeed';
import { getFooterLinks } from './utils';
import type { PaginatedPoems } from '@root/core/api/poems/types';

export function HomePage() {
	const isAuthenticated = useIsAuthenticated();
	const [searchTitle, setSearchTitle] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const { poems, isError, isLoading } = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? POEMS_FEED_LIMIT : POEMS_FEED_LIMIT_UNAUTHENTICATED,
	});
	const isSearching = debouncedSearch.trim().length > 0;

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearch(searchTitle);
		}, 250);

		return () => window.clearTimeout(timeoutId);
	}, [searchTitle]);

	const searchQuery = useQuery<PaginatedPoems>({
		...api.poems.getPoems.query({
			limit: POEMS_FEED_LIMIT,
			searchTitle: debouncedSearch.trim() || undefined,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		}),
		enabled: isSearching,
	});

	const displayedPoems = isSearching ? searchQuery.data?.poems ?? [] : poems;
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
				<VStack
					as='section'
					w='full'
					align='stretch'
					gap={{ base: 6, md: 8 }}
				>
					<Field.Root>
						<Field.Label textStyle='small' fontWeight='medium' color='text'>
							Search poems
						</Field.Label>
						<Input
							value={searchTitle}
							onChange={(event) => setSearchTitle(event.target.value)}
							placeholder='Search by title'
							textStyle='small'
							transition='all 0.22s ease'
							bg='rgba(255, 255, 255, 0.03)'
							borderColor='border'
							_hover={{
								borderColor: 'borderHover',
								bg: 'rgba(255, 255, 255, 0.05)',
							}}
							_focusVisible={{
								borderColor: 'pink.300',
								boxShadow: '0 0 0 3px rgba(255, 143, 189, 1)',
								bg: 'rgba(255, 255, 255, 0.06)',
							}}
							_focus={{
								borderColor: 'pink.300',
								bg: 'rgba(255, 255, 255, 0.06)',
							}}
						/>
					</Field.Root>

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
