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
import { textStyles } from './textStyles';

const tokens = defineTokens({
	colors: {
		pink: {
			50: { value: '#fff0f6' },
			100: { value: '#ffd6e7' },
			200: { value: '#ffb3d2' },
			300: { value: '#ff8fbd' },
		},

		purple: {
			50: { value: '#f7f2ff' },
			100: { value: '#e6d9ff' },
			200: { value: '#d4bfff' },
		},

		brown: {
			50: { value: '#f7ede7' },
			100: { value: '#f0d9c8' },
			200: { value: '#e6c7b2' },
			300: { value: '#d7b49e' },
			400: { value: '#c89f85' },
		},

		blue: {
			50: { value: '#f0f8ff' },
			100: { value: '#d6ecff' },
			200: { value: '#bde0ff' },
		},

		neutral: {
			50: { value: '#fffdfa' },
			100: { value: '#fff7f5' },
			200: { value: '#f4f1f0' },
			800: { value: '#2a2528' },
			900: { value: '#1f1a1d' },
		},
	},
});

const semanticTokens = defineSemanticTokens({
	colors: {
		background: {
			DEFAULT: { value: '{colors.neutral.50}' },
			_dark: { value: '{colors.neutral.900}' },
		},

		surface: {
			DEFAULT: { value: 'white' },
			_dark: { value: '{colors.neutral.800}' },
		},

		text: {
			DEFAULT: { value: '#4a4a4a' },
			_dark: { value: '#f2f2f2' },
		},

		textMuted: {
			DEFAULT: { value: '#7a7a7a' },
			_dark: { value: '#b5b5b5' },
		},

		primary: {
			DEFAULT: { value: '{colors.pink.200}' },
			_dark: { value: '{colors.pink.300}' },
		},

		secondary: {
			DEFAULT: { value: '{colors.purple.200}' },
			_dark: { value: '{colors.purple.200}' },
		},

		tertiary: {
			DEFAULT: { value: '{colors.brown.200}' },
			_dark: { value: '{colors.brown.400}' },
		},

		accent: {
			DEFAULT: { value: '{colors.blue.200}' },
			_dark: { value: '{colors.blue.200}' },
		},

		border: {
			DEFAULT: { value: '{colors.neutral.200}' },
			_dark: { value: '{colors.neutral.800}' },
		},
	},
	gradients: {
		primaryGradient: {
			DEFAULT: {
				value:
					'linear-gradient(135deg, {colors.pink.200}, {colors.purple.200})',
			},
			_dark: {
				value:
					'linear-gradient(135deg, {colors.pink.300}, {colors.purple.200})',
			},
		},
	},
});

const globalCss = defineGlobalStyles({
	html: {
		scrollBehavior: 'smooth',
	},

	body: {
		bg: '{colors.background}',
		color: '{colors.text}',
		minHeight: '100vh',
		display: 'flex',
		justifyContent: 'center',
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
	},
});

export const system = createSystem(defaultConfig, config);
