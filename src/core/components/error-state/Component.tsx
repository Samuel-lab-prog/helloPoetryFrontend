import { Box, Button, type BoxProps, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { stateCardSurfaceStyles } from '../state-card/surfaceStyles';

type ErrorStateCardProps = Omit<BoxProps, 'title'> & {
	eyebrow?: ReactNode;
	title: ReactNode;
	description: ReactNode;
	action?: ReactNode;
	actionAlign?: 'start' | 'end';
	actionLabel?: ReactNode;
	onAction?: () => void;
};

export function ErrorStateCard({
	eyebrow = 'SOMETHING WENT WRONG',
	title,
	description,
	action,
	actionAlign = 'start',
	actionLabel = 'Try again',
	onAction,
	...boxProps
}: ErrorStateCardProps) {
	const renderedAction =
		action ??
		(onAction ? (
			<Button size='sm' colorPalette='pink' variant='solid' onClick={onAction}>
				{actionLabel}
			</Button>
		) : null);

	return (
		<Box role='alert' w='full' {...stateCardSurfaceStyles} {...boxProps}>
			<VStack align='start' gap={3} position='relative' zIndex={1}>
				<Text fontSize='sm' fontWeight='bold' color='pink.200' letterSpacing='0.06em'>
					{eyebrow}
				</Text>
				<Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='semibold' color='white'>
					{title}
				</Text>
				<Text textStyle='small' color='pink.100'>
					{description}
				</Text>
				{renderedAction ? (
					<Box w='full' display='flex' justifyContent={actionAlign === 'end' ? 'end' : 'start'}>
						{renderedAction}
					</Box>
				) : null}
			</VStack>
		</Box>
	);
}
