import { Box } from '@chakra-ui/react';

type TagProps = {
	children: React.ReactNode;
};

export function Tag({ children }: TagProps) {
	return (
		<Box
			display='inline-flex'
			alignItems='center'
			justifyContent='center'
			borderRadius='full'
			px={3}
			py={1}
			textStyle='small'
			fontWeight='medium'
			color='pink.100'
			border='1px solid'
			borderColor='purple.500'
			bg='rgba(255, 255, 255, 0.05)'
			transition='all 0.2s ease'
			_hover={{
				borderColor: 'pink.400',
				bg: 'rgba(255, 255, 255, 0.08)',
			}}
		>
			{children}
		</Box>
	);
}
