import { defineRecipe } from '@chakra-ui/react';

export const linkRecipe = defineRecipe({
	base: {
		textDecoration: 'none',
		cursor: 'pointer',
		borderRadius: 'sm',
		outline: 'none',
		transition:
			'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
		_focusVisible: {
			boxShadow: '0 0 0 2px {colors.purple.950}, 0 0 0 4px {colors.pink.400}',
		},
	},
	variants: {
		size: {
			sm: {
				textStyle: 'small',
			},
			md: {
				textStyle: 'body',
			},
		},
		variant: {
			inline: {
				color: 'pink.200',
				textUnderlineOffset: '3px',
				_hover: {
					color: 'pink.100',
					textDecoration: 'underline',
				},
				_active: {
					color: 'pink.50',
				},
			},
			nav: {
				color: 'pink.100',
				w: 'full',
				px: '3',
				py: '2',
				display: 'flex',
				justifyContent: 'flex-start',
				borderRadius: 'md',
				_hover: {
					bg: 'rgba(255, 255, 255, 0.06)',
					color: 'pink.50',
					transform: 'translateX(2px)',
				},
				_currentPage: {
					fontWeight: '700',
					color: 'pink.50',
					bg: 'rgba(255, 143, 189, 0.14)',
					borderColor: 'pink.500',
				},
			},
			navIcon: {
				color: 'pink.100',
				flex: '1',
				minW: '58px',
				textAlign: 'center',
				px: '1',
				py: '2',
				borderRadius: 'md',
				_hover: {
					bg: 'rgba(255, 255, 255, 0.06)',
					color: 'pink.50',
					transform: 'translateY(-1px)',
				},
				_currentPage: {
					fontWeight: '700',
					color: 'pink.50',
					bg: 'rgba(255, 143, 189, 0.14)',
				},
			},
			muted: {
				color: 'pink.100',
				opacity: '0.9',
				_hover: {
					color: 'pink.50',
					opacity: '1',
				},
				_active: {
					color: 'pink.50',
				},
			},
		},
	},
	defaultVariants: {
		size: 'sm',
		variant: 'inline',
	},
});
