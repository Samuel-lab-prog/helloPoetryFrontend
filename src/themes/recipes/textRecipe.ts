import { defineRecipe } from '@chakra-ui/react';

export const textRecipe = defineRecipe({
	base: {
		textStyle: 'body',
		color: 'text',
		overflowWrap: 'break-word',
	},
	variants: {
		variant: {
			body: {
				textStyle: 'body',
				color: 'text',
			},
			muted: {
				textStyle: 'small',
				color: 'pink.200',
			},
			caption: {
				textStyle: 'smaller',
				color: 'pink.200',
				opacity: '0.9',
			},
			lead: {
				textStyle: 'lead',
				color: 'pink.100',
			},
			error: {
				textStyle: 'small',
				color: 'error',
			},
		},
	},
	defaultVariants: {
		variant: 'body',
	},
});
