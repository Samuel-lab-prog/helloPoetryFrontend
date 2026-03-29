import { Flex, VStack } from '@chakra-ui/react';
import { Footer } from '@root/core/base';
import { useIsAuthenticated } from '@root/core/hooks/useIsAuthenticated';
import { HomeFeed } from './components/HomeFeed';
import { POEMS_FEED_LIMIT, POEMS_FEED_LIMIT_UNAUTHENTICATED } from './constants';
import { useHomeFeed } from './hooks/useHomeFeed';
import { getFooterLinks } from './utils';

export function HomePage() {
	const isAuthenticated = useIsAuthenticated();
	const { poems, isError, isLoading } = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? POEMS_FEED_LIMIT : POEMS_FEED_LIMIT_UNAUTHENTICATED,
	});

	return (
		<Flex direction='column' minH='100%'>
			<Flex as='main' layerStyle='main' direction='column' flex='1'>
				<VStack
					as='section'
					w={{ base: 'full', md: '60%' }}
					mx='auto'
					align='stretch'
					gap={{ base: 6, md: 8 }}
				>
					<HomeFeed poems={poems} isLoading={isLoading} isError={isError} templateColumns='1fr' />
				</VStack>
			</Flex>

			<Footer links={getFooterLinks(isAuthenticated)} />
		</Flex>
	);
}
