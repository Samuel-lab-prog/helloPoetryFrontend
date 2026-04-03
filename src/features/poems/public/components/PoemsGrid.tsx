import { AsyncState } from '@BaseComponents';
import { Flex } from '@chakra-ui/react';

import type { PoemPreviewType } from '../../types';
import { PoemCard } from './PoemCard';
import { PoemGrid } from './PoemGrid';

type PoemsGridProps = {
	poems: PoemPreviewType[];
	isLoading: boolean;
	isError: boolean;
};

export function PoemsGrid({ poems, isLoading, isError }: PoemsGridProps) {
	return (
		<Flex as='section' w='full' direction='column' gap={4}>
			<AsyncState
				isError={isError}
				isEmpty={poems.length === 0 && !isLoading}
				isLoading={isLoading}
			>
				<PoemGrid>
					{poems.map((poem) => (
						<PoemCard key={poem.id} poem={poem} />
					))}
				</PoemGrid>
			</AsyncState>
		</Flex>
	);
}
