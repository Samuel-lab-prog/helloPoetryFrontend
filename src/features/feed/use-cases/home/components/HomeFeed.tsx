import { AsyncState } from '@BaseComponents';
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
					{poems.map((poem) => (
						<Box
							key={poem.id}
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
