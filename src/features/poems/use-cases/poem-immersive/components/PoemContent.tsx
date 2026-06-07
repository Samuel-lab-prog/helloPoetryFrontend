import { MarkdownRenderer } from '@BaseComponents';
import { Box, Heading, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

import { useTextAnimator } from '../hooks/useTextAnimator';

interface PoemContentProps {
	content: string;
}

export function PoemContent({ content }: PoemContentProps) {
	const prefersReducedMotion = useReducedMotion() ?? false;
	const wordFadeIn = useMemo(
		() =>
			keyframes`
				from { opacity: 0; transform: translateY(2px); }
				to { opacity: 1; transform: translateY(0); }
			`,
		[],
	);
	const initialDelay = 0;
	const textAnimator = useTextAnimator({ prefersReducedMotion, initialDelay, wordFadeIn });

	return (
		<Box
			textStyle='small'
			fontSize={{ base: '1rem', md: '1.1rem' }}
			lineHeight={{ base: '1.8', md: '1.95' }}
			letterSpacing='0.01em'
			whiteSpace='pre-wrap'
			textAlign='left'
			w='full'
			pb={{ base: 12, md: 14 }}
		>
			{prefersReducedMotion || !textAnimator ? (
				<MarkdownRenderer content={content} />
			) : (
				<MarkdownRenderer
					content={content}
					componentsOverride={{
						p: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Text as='p' textStyle='body' my={3}>
									{textAnimator.renderNode(children)}
								</Text>
							);
						},
						h1: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Heading as='h1' textStyle='h2' mt={6} mb={3}>
									{textAnimator.renderNode(children)}
								</Heading>
							);
						},
						h2: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Heading as='h2' textStyle='h3' mt={5} mb={2.5}>
									{textAnimator.renderNode(children)}
								</Heading>
							);
						},
						h3: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Heading as='h3' textStyle='h4' mt={4} mb={2.5}>
									{textAnimator.renderNode(children)}
								</Heading>
							);
						},
						h4: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Heading as='h4' textStyle='h5' mt={4} mb={2}>
									{textAnimator.renderNode(children)}
								</Heading>
							);
						},
						h5: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Heading as='h5' textStyle='h6' mt={3} mb={2}>
									{textAnimator.renderNode(children)}
								</Heading>
							);
						},
						h6: ({ children }) => {
							textAnimator.onBlockStart(children);
							return (
								<Heading as='h6' textStyle='h6' mt={3} mb={2}>
									{textAnimator.renderNode(children)}
								</Heading>
							);
						},
						li: ({ children }) => (
							<Box as='li' mb={1.5}>
								{textAnimator.renderNode(children)}
							</Box>
						),
					}}
				/>
			)}
		</Box>
	);
}
