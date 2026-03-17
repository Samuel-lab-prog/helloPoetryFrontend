import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
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
			<HStack gap={3}>
				<Box
					w='40px'
					h='40px'
					display='grid'
					placeItems='center'
					borderRadius='full'
					bg='linear-gradient(135deg, {colors.purple.600}, {colors.pink.400})'
					color='white'
					fontWeight='700'
					fontSize='xs'
				>
					OP
				</Box>
				<VStack align='start' gap={0}>
					<Text textStyle='small' color='pink.100' fontWeight='700' lineHeight='short'>
						Olapoesia
					</Text>
					<Badge size='sm' colorPalette='pink' variant='subtle'>
						Poemas
					</Badge>
				</VStack>
			</HStack>
		</Box>
	);
}
