import { Box, Grid } from '@chakra-ui/react';
import { Children, type ReactNode } from 'react';

type PoemGridProps = {
	children: ReactNode;
	templateColumns?: string | string[];
};

export function PoemGrid({ children, templateColumns }: PoemGridProps) {
	const items = Children.toArray(children);
	const defaultColumns = ['1fr', undefined, '1fr 1fr', undefined, undefined, '1fr 1fr 1fr 1fr'];

	return (
		<Grid templateColumns={templateColumns ?? defaultColumns} gap={2}>
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
