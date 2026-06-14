import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Box, Flex } from '@chakra-ui/react';
import { PoemCard } from '@features/poems/public/components/PoemCard';
import type { PoemPreview } from '@features/poems/public/types';

import { EmptyFeedState } from './EmptyFeedState';
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
				emptyElement={<EmptyFeedState isSearching={isSearching} onClearSearch={onClearSearch} />}
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
