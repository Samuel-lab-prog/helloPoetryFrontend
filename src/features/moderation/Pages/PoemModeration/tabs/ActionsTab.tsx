import { Badge, Heading, Tabs, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Surface } from '@BaseComponents';

export function ActionsTab() {
	return (
		<Tabs.Content value='actions'>
			<Surface variant='panel'>
				<VStack align='start' gap={3}>
					<Heading as='h2' textStyle='h3'>
						Administrative actions
					</Heading>
					<Text textStyle='body' color='pink.100'>
						Coming soon: broader moderation tools.
					</Text>
					<Wrap>
						<WrapItem>
							<Badge colorPalette='pink' variant='subtle'>
								Ban user
							</Badge>
						</WrapItem>
						<WrapItem>
							<Badge colorPalette='pink' variant='subtle'>
								Remove poem
							</Badge>
						</WrapItem>
					</Wrap>
				</VStack>
			</Surface>
		</Tabs.Content>
	);
}
