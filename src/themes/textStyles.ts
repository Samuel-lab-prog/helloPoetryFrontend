import { defineTextStyles } from '@chakra-ui/react';

const baseText = {
	fontFamily: 'system-ui, sans-serif',
	textDecoration: 'none',
	textTransform: 'none',
	overflowWrap: 'break-word' as const,
};

export const textStyles = defineTextStyles({
	body: {
		description: 'The body text style - used in paragraphs and general text',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['sm', 'sm', 'md', 'md', 'lg'],
			lineHeight: ['tall', 'tall', 'tall', 'shorter', 'shorter'],
			letterSpacing: '0',
		},
	},
	lead: {
		description: 'Larger introductory text for page subtitles and highlights',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['md', 'lg', 'xl'],
			lineHeight: ['tall', 'tall', 'shorter'],
			letterSpacing: '-0.005em',
		},
	},
	small: {
		description: 'The small text style - used in descriptions and less prominent text',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['xs', 'xs', 'sm'],
			lineHeight: ['tall', 'tall', 'tall'],
			letterSpacing: '0',
		},
	},
	smaller: {
		description: 'The smaller text style - used in captions and fine print',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['2xs', 'xs'],
			lineHeight: ['tall', 'tall'],
			letterSpacing: '0.01em',
		},
	},
	h1: {
		description: 'Primary page heading',
		value: {
			...baseText,
			fontWeight: '700',
			fontSize: ['2xl', '3xl', '4xl', '5xl'],
			lineHeight: ['short', 'short', 'shorter', 'shortest'],
			letterSpacing: '-0.02em',
		},
	},
	h2: {
		description: 'Section heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['xl', '2xl', '3xl', '3xl'],
			lineHeight: ['short', 'short', 'shorter', 'shorter'],
			letterSpacing: '-0.015em',
		},
	},
	h3: {
		description: 'Subsection heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['lg', 'xl', '2xl'],
			lineHeight: ['short', 'short', 'shorter', 'shorter'],
			letterSpacing: '-0.01em',
		},
	},
	h4: {
		description: 'Card and block title',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['md', 'lg', 'xl'],
			lineHeight: ['short', 'short', 'short', 'shorter'],
			letterSpacing: '-0.005em',
		},
	},
	h5: {
		description: 'Minor heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['sm', 'md', 'lg'],
			lineHeight: ['short', 'short', 'short', 'short'],
			letterSpacing: '0',
		},
	},
	h6: {
		description: 'Eyebrow heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['xs', 'sm', 'md'],
			lineHeight: ['short', 'short', 'short', 'short'],
			letterSpacing: '0.04em',
			textTransform: 'uppercase',
		},
	},
	label: {
		description: 'Field label and metadata text',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['xs', 'sm'],
			lineHeight: ['short', 'short'],
			letterSpacing: '0.02em',
		},
	},
	code: {
		description: 'Inline code and technical snippets',
		value: {
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
			fontWeight: '500',
			fontSize: ['xs', 'sm'],
			lineHeight: ['shorter', 'shorter'],
			letterSpacing: '0',
			textDecoration: 'none',
			textTransform: 'none',
			overflowWrap: 'break-word',
		},
	},
});
