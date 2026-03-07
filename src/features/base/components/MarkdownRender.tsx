import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line no-duplicate-imports
import { type Components } from 'react-markdown';
import { Heading, Text, Mark } from '@chakra-ui/react';

type MarkdownRendererProps = {
	content: string;
};

const components: Components = {
	h1: (p) => (
		<Heading
			as='h1'
			textStyle='h1'
			{...p}
		/>
	),
	h2: (p) => (
		<Heading
			as='h2'
			textStyle='h2'
			{...p}
		/>
	),
	h3: (p) => (
		<Heading
			as='h3'
			textStyle='h3'
			{...p}
		/>
	),
	h4: (p) => (
		<Heading
			as='h4'
			textStyle='h4'
			{...p}
		/>
	),
	h5: (p) => (
		<Heading
			as='h5'
			textStyle='h5'
			{...p}
		/>
	),
	h6: (p) => (
		<Heading
			as='h6'
			textStyle='h6'
			{...p}
		/>
	),

	p: (p) => (
		<Text
			as='p'
			textStyle='body'
			{...p}
		/>
	),

	strong: (p) => (
		<Mark
			as='strong'
			textStyle='body'
			fontWeight='bold'
			display='inline'
			whiteSpace='normal'
			{...p}
		/>
	),
	em: (p) => (
		<Mark
			as='em'
			textStyle='body'
			fontStyle='italic'
			display='inline'
			whiteSpace='normal'
			{...p}
		/>
	),

	mark: (p) => (
		<Mark
			as='mark'
			bg='yellow.200'
			textStyle='body'
			{...p}
		/>
	),

	ul: (p) => (
		<Mark
			as='ul'
			pl={6}
			my={2}
			{...p}
		/>
	),
	ol: (p) => (
		<Mark
			as='ol'
			pl={6}
			my={2}
			{...p}
		/>
	),
	li: (p) => (
		<Mark
			as='li'
			mb={1}
			{...p}
		/>
	),

	a: (p) => (
		<Mark
			as='a'
			color='blue.500'
			textDecoration='underline'
			{...p}
		/>
	),
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	if (!content) return null;

	return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
