import {
	createSystem,
	defaultConfig,
	defineConfig,
	defineGlobalStyles,
	defineSemanticTokens,
	defineTokens,
} from '@chakra-ui/react';

import { animationStyles } from './animationStyles';
import { layerStyles } from './layerStyles';
import { recipes, slotRecipes } from './recipes';
import { textStyles } from './textStyles';

const tokens = defineTokens({
	colors: {
		pink: {
			50: { value: '#fff0f6' },
			100: { value: '#ffd6e7' },
			200: { value: '#ffb3d2' },
			300: { value: '#ff8fbd' },
			400: { value: '#ff6aa8' },
			500: { value: '#f0448e' },
			600: { value: '#cc2f72' },
			700: { value: '#a61f59' },
			800: { value: '#7a1342' },
			900: { value: '#520a2b' },
			950: { value: '#3a0619' },
		},
		purple: {
			50: { value: '#f6f0f6' },
			100: { value: '#e3d6e2' },
			200: { value: '#cbb8ca' },
			300: { value: '#b19bb0' },
			400: { value: '#8e6f8c' },
			500: { value: '#6e4f6c' },
			600: { value: '#51354f' },
			700: { value: '#3a2138' },
			800: { value: '#2a0f27' },
			900: { value: '#1B0019' },
			950: { value: '#120011' },
		},
		neutral: {
			50: { value: '#fffdfa' },
			100: { value: '#fff7f5' },
			200: { value: '#f4f1f0' },
			800: { value: '#2a2528' },
			900: { value: '#1f1a1d' },
		},
		red: {
			400: { value: '#f87171' },
			500: { value: '#ef4444' },
		},
	},
});

const semanticTokens = defineSemanticTokens({
	colors: {
		background: {
			value: {
				DEFAULT: '{colors.purple.950}',
				_dark: '{colors.purple.950}',
			},
		},

		border: {
			value: {
				DEFAULT: '{colors.purple.700}',
				_dark: '{colors.purple.500}',
			},
		},

		borderHover: {
			value: {
				DEFAULT: '{colors.purple.500}',
				_dark: '{colors.pink.300}',
			},
		},

		shadow: {
			value: {
				DEFAULT: '{colors.purple.200}',
				_dark: '{colors.pink.300}',
			},
		},

		surface: {
			value: {
				base: '{colors.white}',
				_dark: '{colors.neutral.800}',
			},
		},

		accent: {
			value: {
				base: '{colors.purple.500}',
				_dark: '{colors.pink.300}',
			},
		},

		text: {
			value: {
				base: '#4a4a4a',
				_dark: '#f2f2f2',
			},
		},

		error: {
			value: {
				base: '{colors.red.500}',
				_dark: '{colors.red.400}',
			},
		},
	},
});

const globalCss = defineGlobalStyles({
	html: {
		scrollBehavior: 'smooth',
		scrollbarGutter: 'stable',
		fontSize: '20px',
	},

	'h1, h2, h3, h4, h5, h6': {
		marginBottom: { base: '0.15em' , md: '0.15em', lg: '0.25em', xl: '0.25', '2xl': '0.25em' },
	},

	body: {
		background: '{colors.background}',
		color: '{colors.text}',
		display: 'flex',
		margin: '0',
		boxSizing: 'border-box',
	},

	'#root': {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		width: '100%',
		minHeight: '100vh',
	},
});

const config = defineConfig({
	globalCss,
	theme: {
		tokens,
		semanticTokens,
		layerStyles,
		textStyles,
		animationStyles,
		recipes,
		slotRecipes,
	},
});

export const system = createSystem(defaultConfig, config);
