import { Box } from '@chakra-ui/react';
import { AsyncState } from '@BaseComponents';
import { PoemCard } from '../../../public/components/PoemCard';
import { PoemGrid } from '../../../public/components/PoemGrid';
import type { PoemPreview } from '@root/core/api/poems/types';

type HomeFeedProps = {
	poems: PoemPreview[];
	isLoading: boolean;
	isError: boolean;
	templateColumns?: string | string[];
};

export function HomeFeed({ poems, isLoading, isError, templateColumns }: HomeFeedProps) {
	return (
		<Box>
			<AsyncState isLoading={isLoading} isError={isError} isEmpty={poems.length === 0}>
				<PoemGrid templateColumns={templateColumns}>
					{poems.map((poem) => (
						<PoemCard key={poem.id} poem={poem} />
					))}
				</PoemGrid>
			</AsyncState>
		</Box>
	);
}
