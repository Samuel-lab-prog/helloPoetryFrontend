import { Box, Button, type BoxProps, Text, VStack } from '@chakra-ui/react';

import { stateCardSurfaceStyles } from '../state-card/surfaceStyles';

type ErrorStateCardProps = BoxProps & {
	eyebrow?: string;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
};

export function ErrorStateCard({
	eyebrow = 'SOMETHING WENT WRONG',
	title,
	description,
	actionLabel = 'Try again',
	onAction,
	...boxProps
}: ErrorStateCardProps) {
	return (
		<Box
			role='alert'
			w='full'
			{...stateCardSurfaceStyles}
			{...boxProps}
		>
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
				{onAction && (
					<Button size='sm' colorPalette='pink' variant='solid' onClick={onAction}>
						{actionLabel}
					</Button>
				)}
			</VStack>
		</Box>
	);
}
