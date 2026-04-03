import { Box } from '@chakra-ui/react';
import { type Keyframes } from '@emotion/react';
import React, { isValidElement, useMemo } from 'react';

interface UseTextAnimatorArgs {
	prefersReducedMotion: boolean;
	initialDelay: number;
	wordFadeIn: Keyframes;
}

export function useTextAnimator({
	prefersReducedMotion,
	initialDelay,
	wordFadeIn,
}: UseTextAnimatorArgs) {
	return useMemo(() => {
		if (prefersReducedMotion) return null;
		let currentDelay = initialDelay;
		let globalIndex = 0;
		const charDelayMs = 50;
		const animationDurationMs = 900;
		const blockGapMs = 0;
		let blockOffsetMs = initialDelay;

		const bumpDelay = (amount: number) => {
			currentDelay += amount;
		};

		const countAnimatedChars = (node: React.ReactNode): number => {
			if (typeof node === 'string') {
				let count = 0;
				for (const char of node) {
					if (char === '\n') continue;
					if (/\s/.test(char)) continue;
					count += 1;
				}
				return count;
			}
			if (Array.isArray(node)) {
				return node.reduce((total, child) => total + countAnimatedChars(child), 0);
			}
			if (isValidElement(node)) {
				const element = node as React.ReactElement<{ children?: React.ReactNode }>;
				return countAnimatedChars(element.props.children);
			}
			return 0;
		};

		const renderText = (value: string) =>
			value.split('').map((char) => {
				const key = `char-${globalIndex++}`;
				if (char === '\n') {
					bumpDelay(0);
					return char;
				}
				if (/\s/.test(char)) return char;
				const delay = currentDelay;
				currentDelay += charDelayMs;
				return (
					<Box
						key={key}
						as='span'
						display='inline-block'
						opacity={0}
						animation={`${wordFadeIn} ${animationDurationMs}ms forwards`}
						animationDelay={`${delay}ms`}
					>
						{char}
					</Box>
				);
			});

		const renderNode = (node: React.ReactNode): React.ReactNode => {
			if (typeof node === 'string') {
				return renderText(node);
			}
			if (Array.isArray(node)) {
				return node.map((child, index) => (
					<React.Fragment key={`node-${globalIndex++}-${index}`}>
						{renderNode(child)}
					</React.Fragment>
				));
			}
			if (isValidElement(node)) {
				const element = node as React.ReactElement<Record<string, unknown>>;
				const childProps = element.props as { children?: React.ReactNode };
				if (childProps?.children === null || childProps?.children === undefined) return node;
				const { children, ...rest } = element.props as {
					children?: React.ReactNode;
				} & Record<string, unknown>;
				return (
					<Box as={element.type as React.ElementType} {...rest}>
						{renderNode(children)}
					</Box>
				);
			}
			return node;
		};

		const onBlockStart = (node: React.ReactNode) => {
			currentDelay = blockOffsetMs;
			const animatedChars = countAnimatedChars(node);
			const blockDurationMs =
				(animatedChars > 0 ? (animatedChars - 1) * charDelayMs : 0) + animationDurationMs;
			blockOffsetMs = currentDelay + blockDurationMs + blockGapMs;
		};

		return { renderText, renderNode, onBlockStart };
	}, [initialDelay, prefersReducedMotion, wordFadeIn]);
}
