import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
	base: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '2',
		fontWeight: 'semibold',
		borderRadius: 'md',
		border: '1px solid transparent',
		userSelect: 'none',
		transform: 'translateY(0)',
		willChange: 'transform, box-shadow, filter',
		transition:
			'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease, filter 0.2s ease',
		_focusVisible: {
			outline: 'none',
			boxShadow: '0 0 0 2px {colors.purple.950}, 0 0 0 4px {colors.pink.400}',
		},
		_disabled: {
			opacity: '0.55',
			cursor: 'not-allowed',
			boxShadow: 'none',
			transform: 'translateY(0)',
			filter: 'saturate(0.75)',
		},
	},
	variants: {
		size: {
			sm: {
				h: '8',
				minW: '8',
				px: '3',
				fontSize: 'xs',
			},
			md: {
				h: '10',
				minW: '10',
				px: '4',
				fontSize: 'sm',
			},
			lg: {
				h: '12',
				minW: '12',
				px: '6',
				fontSize: 'md',
			},
		},
		variant: {
			surface: {
				color: 'white',
				borderColor: 'purple.600',
				background: 'linear-gradient(135deg, {colors.purple.700}, {colors.pink.500})',
				boxShadow: '0 4px 14px rgba(81, 53, 79, 0.28)',
				_hover: {
					background: 'linear-gradient(135deg, {colors.purple.600}, {colors.pink.400})',
					boxShadow: '0 8px 24px rgba(240, 68, 142, 0.35)',
					transform: 'translateY(-1px)',
				},
				_active: {
					background: 'linear-gradient(135deg, {colors.purple.800}, {colors.pink.600})',
					transform: 'translateY(1px) scale(0.99)',
					boxShadow: '0 2px 10px rgba(58, 33, 56, 0.32)',
				},
			},
			solidPurple: {
				bg: 'purple.700',
				color: 'white',
				borderColor: 'purple.600',
				boxShadow: '0 4px 14px rgba(58, 33, 56, 0.3)',
				_hover: {
					bg: 'purple.600',
					boxShadow: '0 8px 20px rgba(58, 33, 56, 0.4)',
					transform: 'translateY(-1px)',
				},
				_active: {
					bg: 'purple.800',
					transform: 'translateY(1px) scale(0.99)',
					boxShadow: '0 2px 10px rgba(58, 33, 56, 0.35)',
				},
			},
			solidPink: {
				bg: 'pink.400',
				color: 'white',
				borderColor: 'pink.600',
				boxShadow: '0 4px 14px rgba(240, 68, 142, 0.28)',
				_hover: {
					bg: 'pink.500',
					boxShadow: '0 8px 20px rgba(240, 68, 142, 0.35)',
					transform: 'translateY(-1px)',
				},
				_active: {
					bg: 'pink.600',
					transform: 'translateY(1px) scale(0.99)',
					boxShadow: '0 2px 10px rgba(122, 19, 66, 0.3)',
				},
			},
			outlinePurple: {
				bg: 'transparent',
				color: 'purple.200',
				borderColor: 'purple.500',
				_hover: {
					bg: 'purple.900',
					color: 'pink.200',
					borderColor: 'pink.400',
					transform: 'translateY(-1px)',
				},
				_active: {
					bg: 'purple.800',
					transform: 'translateY(1px) scale(0.99)',
				},
			},
			ghostPink: {
				bg: 'transparent',
				color: 'pink.300',
				borderColor: 'transparent',
				_hover: {
					bg: 'purple.900',
					color: 'pink.200',
					borderColor: 'purple.700',
					transform: 'translateY(-1px)',
				},
				_active: {
					bg: 'purple.800',
					transform: 'translateY(1px) scale(0.99)',
				},
			},
			danger: {
				bg: 'red.500',
				color: 'white',
				borderColor: 'red.500',
				boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
				_hover: {
					bg: 'red.400',
					boxShadow: '0 8px 20px rgba(239, 68, 68, 0.32)',
					transform: 'translateY(-1px)',
				},
				_active: {
					bg: 'red.500',
					filter: 'brightness(0.92)',
					transform: 'translateY(1px) scale(0.99)',
					boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
				},
			},
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'surface',
	},
});
