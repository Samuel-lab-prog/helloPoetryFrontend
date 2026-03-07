import { Grid } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type PostGridProps = {
	children: ReactNode;
};

export function PostGrid({ children }: PostGridProps) {
	return (
		<Grid
			templateColumns={[
				'1fr',
				undefined,
				'1fr 1fr',
				undefined,
				undefined,
				'1fr 1fr 1fr 1fr',
			]}
			gap={2}
		>
			{children}
		</Grid>
	);
}
