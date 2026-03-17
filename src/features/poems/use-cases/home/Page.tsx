import { Flex, VStack } from '@chakra-ui/react';
import { Footer } from '@root/core/base';
import { useIsAuthenticated } from '@root/core/hooks/useIsAuthenticated';
import { HomeFeed } from './components/HomeFeed';
import { HomeHeader } from './components/HomeHeader';
import { POEMS_FEED_LIMIT, POEMS_FEED_LIMIT_UNAUTHENTICATED } from './constants';
import { useHomeFeed } from './hooks/useHomeFeed';
import { getFooterLinks, getPageSubtitle, getPageTitle } from './utils';

export function HomePage() {
	const isAuthenticated = useIsAuthenticated();
	const { poems, isError, isLoading, isPersonalizedFeed } = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? POEMS_FEED_LIMIT : POEMS_FEED_LIMIT_UNAUTHENTICATED,
	});

	const title = getPageTitle(isAuthenticated, isPersonalizedFeed);
	const subtitle = getPageSubtitle(isAuthenticated, isPersonalizedFeed);

	return (
		<Flex direction='column' minH='100%'>
			<Flex as='main' layerStyle='main' direction='column' flex='1'>
				<VStack as='section' w='full' align='stretch' gap={{ base: 6, md: 8 }}>
					<HomeHeader title={title} subtitle={subtitle} />
					<HomeFeed poems={poems} isLoading={isLoading} isError={isError} />
				</VStack>
			</Flex>

			<Footer links={getFooterLinks(isAuthenticated)} />
		</Flex>
	);
}
