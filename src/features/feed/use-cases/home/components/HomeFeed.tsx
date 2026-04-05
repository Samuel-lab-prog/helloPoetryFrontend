import { AsyncState } from '@BaseComponents';
import { Box, Flex } from '@chakra-ui/react';
import { PoemCard } from '@features/poems/public/components/PoemCard';
import type { PoemPreview } from '@features/poems/public/types';

type HomeFeedProps = {
	poems: PoemPreview[];
	isLoading: boolean;
	isError: boolean;
};

export function HomeFeed({ poems, isLoading, isError }: HomeFeedProps) {
	return (
		<Box>
			<AsyncState isLoading={isLoading} isError={isError} isEmpty={poems.length === 0}>
				<Flex direction='column' gap={2}>
					{poems.map((poem) => (
						<Box
							key={poem.id}
							mx={{ base: 2, md: 3 }}
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
