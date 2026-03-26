import { Badge, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { Surface } from '@root/core/base';

export function UnauthorizedPage({ onBack }: { onBack: () => void }) {
	return (
		<Flex as='main' layerStyle='main' direction='column' align='center' justify='center'>
			<Surface variant='gradient' maxW='2xl' w='full'>
				<VStack align='start' gap={3}>
					<Badge colorPalette='pink' variant='subtle'>
						Moderation
					</Badge>
					<Heading as='h1' textStyle='h2'>
						Restricted access
					</Heading>
					<Text textStyle='body' color='pink.100'>
						This page is restricted to moderators and administrators.
					</Text>
					<Button size='sm' variant='solidPink' onClick={onBack}>
						Back
					</Button>
				</VStack>
			</Surface>
		</Flex>
	);
}
