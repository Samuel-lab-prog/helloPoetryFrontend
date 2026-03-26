import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { useSavedPoems } from '@root/features/poems/public/hooks/useManageSavedPoems';
import { ProfileAccessGate } from '../components/my-profile/ProfileAccessGate';
import { SavedPoemsSection } from '../components/my-profile/SavedPoemsSection';

export function MyProfileSavedPoemsPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const { savedPoems, isLoadingSavedPoems, unsavePoem, isSavingPoem, saveError } = useSavedPoems(
		Boolean(authClient?.id),
	);

	if (!authClient?.id) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex
					mb={8}
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					direction={{ base: 'column', md: 'row' }}
					gap={3}
				>
					<Heading as='h1' textStyle='h2'>
						All saved poems
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>Back to profile</NavLink>
					</Button>
				</Flex>

				<SavedPoemsSection
					savedPoems={savedPoems}
					isLoadingSavedPoems={isLoadingSavedPoems}
					isSavingPoem={isSavingPoem}
					saveError={saveError}
					onUnsavePoem={unsavePoem}
				/>
			</Box>
		</Flex>
	);
}
