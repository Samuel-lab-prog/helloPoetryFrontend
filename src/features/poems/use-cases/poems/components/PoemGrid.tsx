import { Box, Grid } from '@chakra-ui/react';
import { Children, type ReactNode } from 'react';

type PoemGridProps = {
	children: ReactNode;
};

export function PoemGrid({ children }: PoemGridProps) {
	const items = Children.toArray(children);

	return (
		<Grid
			templateColumns={['1fr', undefined, '1fr 1fr', undefined, undefined, '1fr 1fr 1fr 1fr']}
			gap={2}
		>
			{items.map((child, index) => (
				<Box
					key={`poem-grid-item-${index}`}
					animationName='slide-from-bottom, fade-in'
					animationDuration='320ms'
					animationTimingFunction='ease-out'
					animationFillMode='backwards'
					animationDelay={`${30 + index * 30}ms`}
				>
					{child}
				</Box>
			))}
		</Grid>
	);
}
