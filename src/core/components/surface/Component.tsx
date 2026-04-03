import { Box, type BoxProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { surfaceVariants } from './variants';

export type SurfaceVariant = keyof typeof surfaceVariants;

export interface SurfaceProps extends BoxProps {
	variant?: SurfaceVariant;
}

/**
 * A styled container that applies a consistent surface variant.
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
	{ variant = 'panel', ...props },
	ref,
) {
	return <Box ref={ref} {...surfaceVariants[variant]} {...props} />;
});
