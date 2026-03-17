import { Badge, Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';

export function FooterBrand() {
	return (
		<VStack align='start' gap={3}>
			<HStack gap={3}>
				<Box
					w='44px'
					h='44px'
					display='grid'
					placeItems='center'
					borderRadius='full'
					bg='linear-gradient(135deg, {colors.purple.600}, {colors.pink.400})'
					color='white'
					fontWeight='700'
					fontSize='sm'
				>
					OP
				</Box>
				<VStack align='start' gap={0}>
					<Heading as='h3' textStyle='h4' color='pink.100'>
						Olapoesia
					</Heading>
					<Badge size='sm' colorPalette='pink' variant='subtle'>
						Plataforma de Poemas
					</Badge>
				</VStack>
			</HStack>

			<Text textStyle='small' color='pink.200' maxW='sm'>
				Publique poemas, salve favoritos, comente e construa conexoes com outros autores.
			</Text>
		</VStack>
	);
}
