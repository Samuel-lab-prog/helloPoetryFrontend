import { Box } from '@chakra-ui/react';
import { AsyncState } from '@root/core/base';
import { PoemCard } from '../../../public/components/PoemCard';
import { PoemGrid } from '../../../public/components/PoemGrid';
import type { PoemPreview } from '@root/core/api/poems/types';

type HomeFeedProps = {
	poems: PoemPreview[];
	isLoading: boolean;
	isError: boolean;
};

export function HomeFeed({ poems, isLoading, isError }: HomeFeedProps) {
	return (
		<Box>
			<AsyncState isLoading={isLoading} isError={isError} isEmpty={poems.length === 0}>
				<PoemGrid>
					{poems.map((poem) => (
						<PoemCard key={poem.id} poem={poem} />
					))}
				</PoemGrid>
			</AsyncState>
		</Box>
	);
}
