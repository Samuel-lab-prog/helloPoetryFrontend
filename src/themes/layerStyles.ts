import { defineLayerStyles } from '@chakra-ui/react';

export const layerStyles = defineLayerStyles({
	main: {
		description: 'Default main styling',
		value: {
			paddingLeft: ['4', '4', '8', '8', '8'],
			paddingRight: ['4', '4', '8', '8', '8'],
			paddingTop: ['8', '8', '12', '12', '12'],
			paddingBottom: ['12', '12', '12', '12', '12'],
			display: 'flex',
      width: 'full',
		},
	},
});
