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
			borderRadius='md'
			px={3}
			py={1}
			textStyle='small'
			fontWeight='medium'
			bg='gray.300'
		>
			{children}
		</Box>
	);
}
