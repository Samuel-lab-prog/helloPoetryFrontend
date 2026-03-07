import { defineAnimationStyles } from '@chakra-ui/react';

export const animationStyles = defineAnimationStyles({
	bounceFadeIn: {
		value: {
			animationName: 'bounce, fade-in',
			animationDuration: '1s',
			animationTimingFunction: 'ease-in-out',
			animationIterationCount: 'infinite',
		},
	},
});
