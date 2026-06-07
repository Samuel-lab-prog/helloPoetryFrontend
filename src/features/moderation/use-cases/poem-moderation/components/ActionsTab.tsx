import { Surface } from '@BaseComponents';
import { Badge, Heading, Text, VStack } from '@chakra-ui/react';

export function ActionsTab() {
	return (
		<Surface variant='panel'>
			<VStack align='start' gap={3}>
				<Heading as='h2' textStyle='h4'>
					Administrative actions
				</Heading>
				<Text textStyle='small' color='pink.100'>
					Temporarily unavailable for maintenance.
				</Text>
				<Badge colorPalette='pink' variant='subtle'>
					Maintenance
				</Badge>
			</VStack>
		</Surface>
	);
}
