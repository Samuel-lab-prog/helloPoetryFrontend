import { defineSlotRecipe } from '@chakra-ui/react';
import { cardAnatomy } from '@chakra-ui/react/anatomy';

export const cardSlotRecipe = defineSlotRecipe({
	className: 'chakra-card',
	slots: cardAnatomy.keys(),
	base: {
		root: {
			display: 'flex',
			flexDirection: 'column',
			position: 'relative',
			minWidth: '0',
			wordWrap: 'break-word',
			borderRadius: 'xl',
			textAlign: 'start',
			borderWidth: '1px',
			overflow: 'hidden',
			transition:
				'background-color 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease, transform 0.2s ease',
		},
		title: {
			textStyle: 'h4',
			fontWeight: '600',
		},
		description: {
			textStyle: 'small',
			color: 'pink.200',
		},
		header: {
			display: 'flex',
			flexDirection: 'column',
			gap: '1.5',
			paddingInline: 'var(--card-padding)',
			paddingTop: 'var(--card-padding)',
		},
		body: {
			paddingInline: 'var(--card-padding)',
			paddingTop: 'calc(var(--card-padding) * 0.5)',
			paddingBottom: 'calc(var(--card-padding) * 0.5)',
			flex: '1',
			display: 'flex',
			flexDirection: 'column',
		},
		footer: {
			display: 'flex',
			alignItems: 'center',
			gap: '2',
			paddingInline: 'var(--card-padding)',
			paddingBottom: 'var(--card-padding)',
		},
	},
	variants: {
		size: {
			sm: {
				root: { '--card-padding': 'spacing.4' },
				title: { textStyle: 'h5' },
			},
			md: {
				root: { '--card-padding': 'spacing.5' },
				title: { textStyle: 'h4' },
			},
			lg: {
				root: { '--card-padding': 'spacing.6' },
				title: { textStyle: 'h3' },
			},
		},
		variant: {
			surface: {
				root: {
					bg: 'rgba(255, 255, 255, 0.02)',
					borderColor: 'purple.700',
					backdropFilter: 'blur(4px)',
				},
			},
			interactive: {
				root: {
					bg: 'rgba(255, 255, 255, 0.02)',
					borderColor: 'purple.700',
					backdropFilter: 'blur(4px)',
					_hover: {
						borderColor: 'purple.500',
						bg: 'rgba(255, 255, 255, 0.04)',
						transform: 'translateY(-2px)',
						boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
					},
					_focusWithin: {
						borderColor: 'pink.400',
						bg: 'rgba(255, 255, 255, 0.06)',
						boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
					},
				},
			},
			elevated: {
				root: {
					bg: 'rgba(255, 255, 255, 0.03)',
					borderColor: 'purple.600',
					backdropFilter: 'blur(6px)',
					boxShadow: '0 12px 32px rgba(18, 0, 17, 0.3)',
				},
			},
			subtle: {
				root: {
					bg: 'rgba(255, 255, 255, 0.01)',
					borderColor: 'purple.800',
				},
			},
			danger: {
				root: {
					bg: 'rgba(248, 113, 113, 0.08)',
					borderColor: 'red.500',
					backdropFilter: 'blur(4px)',
				},
				title: {
					color: 'red.400',
				},
			},
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'surface',
	},
});
