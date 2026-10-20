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
			fontSize: ['16px', '16px', '17px', '18px'],
			lineHeight: ['1.65', '1.65', '1.65', '1.6'],
			letterSpacing: '0',
		},
	},
	lead: {
		description: 'Larger introductory text for page subtitles and highlights',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['18px', '20px', '22px'],
			lineHeight: ['1.6', '1.55', '1.5'],
			letterSpacing: '-0.005em',
		},
	},
	small: {
		description: 'The small text style - used in descriptions and less prominent text',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['14px', '14px', '15px'],
			lineHeight: ['1.5', '1.5', '1.45'],
			letterSpacing: '0',
		},
	},
	smaller: {
		description: 'The smaller text style - used in captions and fine print',
		value: {
			...baseText,
			fontWeight: '400',
			fontSize: ['13px', '14px'],
			lineHeight: ['1.4', '1.4'],
			letterSpacing: '0.01em',
		},
	},
	h1: {
		description: 'Primary page heading',
		value: {
			...baseText,
			fontWeight: '700',
			fontSize: ['30px', '34px', '40px', '44px'],
			lineHeight: ['1.2', '1.18', '1.15', '1.12'],
			letterSpacing: '-0.02em',
		},
	},
	h2: {
		description: 'Section heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['26px', '30px', '34px'],
			lineHeight: ['1.25', '1.2', '1.18'],
			letterSpacing: '-0.015em',
		},
	},
	h3: {
		description: 'Subsection heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['23px', '26px', '30px'],
			lineHeight: ['1.25', '1.2', '1.18'],
			letterSpacing: '-0.01em',
		},
	},
	h4: {
		description: 'Card and block title',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['19px', '21px', '23px'],
			lineHeight: ['1.3', '1.25', '1.22'],
			letterSpacing: '-0.005em',
		},
	},
	h5: {
		description: 'Minor heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['15px', '16px', '18px'],
			lineHeight: ['1.3', '1.25', '1.25'],
			letterSpacing: '0',
		},
	},
	h6: {
		description: 'Eyebrow heading',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['14px', '15px', '16px'],
			lineHeight: ['1.3', '1.25', '1.25'],
			letterSpacing: '0.04em',
			textTransform: 'uppercase',
		},
	},
	label: {
		description: 'Eyebrow label and compact section text',
		value: {
			...baseText,
			fontWeight: '600',
			fontSize: ['12px', '13px'],
			lineHeight: ['1.3', '1.3'],
			letterSpacing: '0.06em',
			textTransform: 'uppercase',
		},
	},
	code: {
		description: 'Inline code and technical snippets',
		value: {
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
			fontWeight: '500',
			fontSize: ['14px', '15px'],
			lineHeight: ['1.45', '1.45'],
			letterSpacing: '0',
			textDecoration: 'none',
			textTransform: 'none',
			overflowWrap: 'break-word',
		},
	},
});
