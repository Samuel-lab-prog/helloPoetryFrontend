import { AsyncState } from '@BaseComponents';
import { Box } from '@chakra-ui/react';
import type { PoemPreview } from '@features/poems/api/types';
import { PoemCard } from '@root/features/poems/public/components/PoemCard';
import { PoemGrid } from '@root/features/poems/public/components/PoemGrid';

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
