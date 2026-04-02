import { type BoxProps } from '@chakra-ui/react';

const baseStyle: BoxProps = {
	px: { base: 4, md: 6 },
	py: { base: 5, md: 7 },
};

/**
 * Shared surface variants for cards/panels and layout containers.
 */
export const surfaceVariants = {
	panel: {
		...baseStyle,
		border: '1px solid',
		borderColor: 'purple.700',
		borderRadius: 'xl',
		bg: 'rgba(255, 255, 255, 0.02)',
		backdropFilter: 'blur(4px)',
	},
	soft: {
		...baseStyle,
		border: '1px solid',
		borderColor: 'purple.700',
		borderRadius: 'xl',
		bg: 'rgba(255, 255, 255, 0.015)',
	},
	gradient: {
		...baseStyle,
		border: '1px solid',
		borderColor: 'purple.700',
		borderRadius: '2xl',
		bg: 'linear-gradient(145deg, rgba(122,19,66,0.2) 0%, rgba(27,0,25,0.34) 100%)',
		backdropFilter: 'blur(4px)',
	},
	elevated: {
		...baseStyle,
		border: '1px solid',
		borderColor: 'purple.600',
		borderRadius: '2xl',
		bg: 'rgba(255, 255, 255, 0.03)',
		backdropFilter: 'blur(6px)',
		boxShadow: '0 12px 32px rgba(18, 0, 17, 0.3)',
	},
} as const;
