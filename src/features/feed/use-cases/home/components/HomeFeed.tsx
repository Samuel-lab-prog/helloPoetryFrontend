import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Box, Flex } from '@chakra-ui/react';
import { PoemCard } from '@features/poems/public/components/PoemCard';
import type { PoemPreview } from '@features/poems/public/types';

import { LoadingPoemsSkeletons } from './LoadingPoemsSkeletons';

type HomeFeedProps = {
	poems: PoemPreview[];
	isLoading: boolean;
	isError: boolean;
};

export function HomeFeed({ poems, isLoading, isError }: HomeFeedProps) {
	const showSkeletons = isLoading && poems.length === 0;

	return (
		<Box>
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
					<Box
						borderTop='1px solid'
						borderColor='purple.700'
						p={4}
						textStyle='body'
						color='pink.200'
					>
						No poems found. Try clearing the search or check back later.
					</Box>
				}
			>
				<Flex direction='column' gap={2}>
					{poems.map((poem, index) => (
						<Box
							key={poem.id}
							animationName='slide-from-bottom, fade-in'
							animationDuration='320ms'
							animationTimingFunction='ease-out'
							animationFillMode='backwards'
							animationDelay={`${60 + index * 70}ms`}
							borderTop='1px solid'
							borderColor='purple.700'
							_first={{ borderTop: 'none' }}
							pt={3}
						>
							<PoemCard poem={poem} variant='flat' />
						</Box>
					))}
				</Flex>
			</AsyncState>
		</Box>
	);
}
