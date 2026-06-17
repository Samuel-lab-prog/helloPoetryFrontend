import { Surface } from '@BaseComponents';
import { Box, Heading, VStack } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';

import { BanUserForm } from './BanUserForm';
import { RemovePoemForm } from './RemovePoemForm';

export function ActionsTab() {
	const authClient = useAuthClientStore((state) => state.authClient);

	return (
		<Surface variant='panel'>
			<VStack align='stretch' gap={5}>
				<Heading as='h2' textStyle='h4'>
					Administrative actions
				</Heading>
				<Box>
					<Heading as='h3' textStyle='h5' mb={3}>
						Remove poem
					</Heading>
					<RemovePoemForm />
				</Box>
				<Box borderTop='1px solid' borderColor='purple.700' pt={5}>
					<Heading as='h3' textStyle='h5' mb={3}>
						Ban user
					</Heading>
					<BanUserForm authClient={authClient} />
				</Box>
			</VStack>
		</Surface>
	);
}
