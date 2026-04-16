import { Box, Button, Text, VStack } from '@chakra-ui/react';

type ErrorStateCardProps = {
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
}: ErrorStateCardProps) {
	return (
		<Box
			role='alert'
			w='full'
			maxW={{ base: 'calc(100% - 2rem)', md: 'full' }}
			mx={{ base: 4, md: 0 }}
			position='relative'
			overflow='hidden'
			borderRadius='2xl'
			border='1px solid'
			borderColor='pink.500'
			bgGradient='linear(to-br, #2A1539, #1E1B38 45%, #191F3A)'
			p={{ base: 5, md: 6 }}
			shadow='0 12px 30px rgba(0,0,0,0.35)'
			_before={{
				content: '""',
				position: 'absolute',
				top: '-40px',
				right: '-40px',
				w: '140px',
				h: '140px',
				borderRadius: 'full',
				bg: 'pink.500',
				filter: 'blur(70px)',
				opacity: 0.25,
			}}
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
