import { defineLayerStyles } from '@chakra-ui/react';

export const layerStyles = defineLayerStyles({
	main: {
		description: 'Default main styling',
		value: {
			paddingLeft: ['4', undefined, '8', '12', '16'],
			paddingRight: ['4', undefined, '8', '12', '16'],
			paddingTop: ['8', undefined, '16', '20', '24'],
			paddingBottom: ['12', undefined, '16', '20', '24'],
			display: 'flex',
		},
	},
});
