import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { usePoemCollections } from '@root/features/poems/use-cases/poems/hooks/usePoemCollections';
import { useMyPoems } from '@root/features/poems/use-cases/poems/hooks/useMyPoems';
import { useSavedPoems } from '@root/features/poems/use-cases/poems/hooks/useSavedPoems';
import { useMyProfile } from '../hooks/useMyProfile';
import { ProfileAccessGate } from '../components/my-profile/ProfileAccessGate';
import { CollectionsSection } from '../components/my-profile/CollectionsSection';

export function MyProfileCollectionsPage() {
	const { profile, isMissingClient, isLoading: isProfileLoading } = useMyProfile();
	const {
		collections,
		isLoadingCollections,
		createCollection,
		deleteCollection,
		addPoemToCollection,
		removePoemFromCollection,
		isUpdatingCollections,
		collectionsError,
	} = usePoemCollections(!isMissingClient);
	const { poems: myPoems } = useMyPoems(!isMissingClient);
	const { savedPoems } = useSavedPoems(!isMissingClient);

	if (isMissingClient) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	if (isProfileLoading || !profile) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<Text textStyle='body'>Carregando perfil...</Text>
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
						Todas as minhas colecoes
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>Voltar ao perfil</NavLink>
					</Button>
				</Flex>

				<CollectionsSection
					profile={profile}
					collections={collections}
					myPoems={myPoems}
					savedPoems={savedPoems}
					isLoadingCollections={isLoadingCollections}
					isUpdatingCollections={isUpdatingCollections}
					collectionsError={collectionsError}
					onCreateCollection={createCollection}
					onDeleteCollection={deleteCollection}
					onAddPoemToCollection={addPoemToCollection}
					onRemovePoemFromCollection={removePoemFromCollection}
				/>
			</Box>
		</Flex>
	);
}
