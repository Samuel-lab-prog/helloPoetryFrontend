import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export function Logo() {
	const navigate = useNavigate();

	return (
		<Box
			onClick={() => navigate('/')}
			cursor='pointer'
			transition='opacity 0.2s ease'
			_hover={{ opacity: 0.8 }}
		>
			<Text
				color='pink.100'
				fontWeight='700'
				lineHeight='short'
				fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}
				letterSpacing={{ base: '-0.01em', md: '0' }}
			>
				HelloPoetry
			</Text>
		</Box>
	);
}
