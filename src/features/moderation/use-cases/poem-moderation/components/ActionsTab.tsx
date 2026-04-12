import { Surface } from '@BaseComponents';
import { Badge, Heading, Tabs, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';

import { BanUserForm } from './BanUserForm';
import { RemovePoemForm } from './RemovePoemForm';

export function ActionsTab() {
	const authClient = useAuthClientStore((state) => state.authClient);

	return (
		<Tabs.Content value='actions'>
			<Surface variant='panel'>
				<VStack align='start' gap={3}>
					<Heading as='h2' textStyle='h3'>
						Administrative actions
					</Heading>
					<Text textStyle='body' color='pink.100'>
						Ban users directly from moderation.
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

					<BanUserForm authClient={authClient} />
					<RemovePoemForm />
				</VStack>
			</Surface>
		</Tabs.Content>
	);
}
