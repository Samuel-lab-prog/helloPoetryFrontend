import { Box } from '@chakra-ui/react';
import { AsyncState } from '@root/core/base';
import { PoemCard } from '../../poems/components/PoemCard';
import { PoemGrid } from '../../poems/components/PoemGrid';
import type { PoemPreviewType } from '../../../types';

type HomeFeedProps = {
	poems: PoemPreviewType[];
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
