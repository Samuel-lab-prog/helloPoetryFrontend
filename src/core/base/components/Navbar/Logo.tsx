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
			<Text textStyle='small' color='pink.100' fontWeight='700' lineHeight='short'>
				HelloPoetry
			</Text>
		</Box>
	);
}
