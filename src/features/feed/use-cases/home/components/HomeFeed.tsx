import { AsyncState, EmptyStateCard, ErrorStateCard } from '@BaseComponents';
import { Box, Button, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { PoemCard } from '@features/poems/public/components/PoemCard';
import type { PoemPreview } from '@features/poems/public/types';
import { SearchX, Sparkles, X } from 'lucide-react';

import { getHomeFeedEntryAnimationStyle } from './homeFeedAnimations';
import { LoadingPoemsSkeletons } from './LoadingPoemsSkeletons';

type HomeFeedProps = {
	poems: PoemPreview[];
	isLoading: boolean;
	isError: boolean;
	isSearching: boolean;
	onClearSearch?: () => void;
};

export function HomeFeed({ poems, isLoading, isError, isSearching, onClearSearch }: HomeFeedProps) {
	const showSkeletons = isLoading && poems.length === 0;

	return (
		<Box px={{ base: 0, md: 0 }} pt={{ base: 0, md: 0 }}>
			<AsyncState
				isLoading={showSkeletons}
				isError={isError}
				isEmpty={poems.length === 0}
				loadingElement={LoadingPoemsSkeletons}
				errorElement={
					<ErrorStateCard
						eyebrow='FEED UNAVAILABLE'
						title='We could not load your feed right now.'
						description='Your poems are safe. Please try again in a moment, or refresh the page to reconnect.'
						actionLabel='Refresh feed'
						onAction={() => window.location.reload()}
					/>
				}
				emptyElement={
					<EmptyStateCard
						mt={4}
						mx={3}
						eyebrow={isSearching ? 'Search empty' : 'Nothing here yet'}
						eyebrowIcon={isSearching ? SearchX : Sparkles}
						title={isSearching ? 'No poems match this search' : 'This feed is still quiet'}
						description={
							isSearching
								? 'Try another title or clear the search to see the full feed again.'
								: 'When new poems are published, they will appear here with a cleaner, more visual empty state.'
						}
						action={
							isSearching && onClearSearch ? (
								<Button size='sm' variant='solidPink' onClick={onClearSearch}>
									<HStack gap={2}>
										<Icon as={X} boxSize={3.5} />
										<Text as='span'>Clear search</Text>
									</HStack>
								</Button>
							) : null
						}
						actionAlign='end'
					/>
				}
			>
				<Flex direction='column' gap={0}>
					{poems.map((poem, index) => (
						<Box
							key={poem.id}
							{...getHomeFeedEntryAnimationStyle(index)}
							borderTop='1px solid'
							borderColor='purple.700'
							_first={{ borderTop: 'none' }}
							pt={2}
						>
							<PoemCard poem={poem} variant='flat' />
						</Box>
					))}
				</Flex>
			</AsyncState>
		</Box>
	);
}
