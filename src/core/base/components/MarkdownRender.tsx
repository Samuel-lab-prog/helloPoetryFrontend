import { Box, Heading, Link, Mark, Text } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line no-duplicate-imports
import { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownRendererProps = {
	content: string;
	componentsOverride?: Components;
};

const components: Components = {
	h1: ({ children }) => (
		<Heading as='h1' textStyle='h1' mt={8} mb={4}>
			{children}
		</Heading>
	),
	h2: ({ children }) => (
		<Heading as='h2' textStyle='h2' mt={7} mb={3}>
			{children}
		</Heading>
	),
	h3: ({ children }) => (
		<Heading as='h3' textStyle='h3' mt={6} mb={3}>
			{children}
		</Heading>
	),
	h4: ({ children }) => (
		<Heading as='h4' textStyle='h4' mt={5} mb={2}>
			{children}
		</Heading>
	),
	h5: ({ children }) => (
		<Heading as='h5' textStyle='h5' mt={4} mb={2}>
			{children}
		</Heading>
	),
	h6: ({ children }) => (
		<Heading as='h6' textStyle='h6' mt={4} mb={2}>
			{children}
		</Heading>
	),

	p: ({ children }) => (
		<Text as='p' textStyle='body' my={3}>
			{children}
		</Text>
	),

	strong: ({ children }) => (
		<Text as='strong' fontWeight='700' display='inline' color='pink.400'>
			{children}
		</Text>
	),
	em: ({ children }) => (
		<Text as='em' fontStyle='italic' display='inline'>
			{children}
		</Text>
	),

	mark: ({ children }) => (
		<Mark as='mark' bg='pink.200' color='purple.900' textStyle='body'>
			{children}
		</Mark>
	),

	ul: ({ children }) => (
		<Box as='ul' textStyle='body' pl={6} my={3}>
			{children}
		</Box>
	),
	ol: ({ children }) => (
		<Box as='ol' textStyle='body' pl={6} my={3}>
			{children}
		</Box>
	),
	li: ({ children }) => (
		<Box as='li' mb={1.5}>
			{children}
		</Box>
	),

	a: ({ children, href }) => (
		<Link variant='inline' size='md' href={href}>
			{children}
		</Link>
	),
	pre: ({ children }) => (
		<Box
			as='pre'
			my={4}
			px={4}
			py={3}
			borderRadius='md'
			bg='rgba(255, 255, 255, 0.04)'
			border='1px solid'
			borderColor='purple.700'
			overflowX='auto'
		>
			{children}
		</Box>
	),
	code: ({ children, className }) => {
		const isBlock = className?.includes('language-');
		if (isBlock) {
			return (
				<Box as='code' textStyle='code' whiteSpace='pre'>
					{children}
				</Box>
			);
		}

		return (
			<Box
				as='code'
				textStyle='code'
				px={1.5}
				py={0.5}
				borderRadius='sm'
				bg='rgba(255, 255, 255, 0.08)'
				color='pink.100'
			>
				{children}
			</Box>
		);
	},
	blockquote: ({ children }) => (
		<Box
			as='blockquote'
			my={4}
			pl={4}
			py={1}
			borderLeft='3px solid'
			borderColor='pink.400'
			bg='rgba(255, 255, 255, 0.03)'
			borderRadius='sm'
			textStyle='body'
			fontStyle='italic'
		>
			{children}
		</Box>
	),
	hr: () => <Box as='hr' my={6} borderColor='purple.700' />,
};

export function MarkdownRenderer({ content, componentsOverride }: MarkdownRendererProps) {
	if (!content) return null;

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={componentsOverride ? { ...components, ...componentsOverride } : components}
		>
			{content}
		</ReactMarkdown>
	);
}
