import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useMyPoems } from '@features/poems/public/hooks/useGetMyPoems';
import { usePoemCollections } from '@features/poems/public/hooks/useManagePoemCollections';
import { useSavedPoems } from '@features/poems/public/hooks/useManageSavedPoems';
import { NavLink } from 'react-router-dom';

import { CollectionsSection } from '../../public/components/my-profile/CollectionsSection';
import { ProfileAccessGate } from '../../public/components/my-profile/ProfileAccessGate';
import { useMyProfile } from '../../public/hooks/useMyProfile';

export function MyProfileCollectionsPage() {
	const { profile, isMissingClient, isLoading: isProfileLoading } = useMyProfile();
	const {
		collections,
		isLoadingCollections,
		createCollection,
		deleteCollection,
		addPoemToCollection,
		removePoemFromCollection,
		isCreatingCollection,
		isDeletingCollection,
		isAddingCollectionItem,
		isRemovingCollectionItem,
		collectionsError,
	} = usePoemCollections(!isMissingClient);
	const { poems: myPoems } = useMyPoems(!isMissingClient);
	const { savedPoems } = useSavedPoems(!isMissingClient);

	if (isMissingClient) {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	if (isProfileLoading || !profile) {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<Text textStyle='body'>Loading profile...</Text>
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
			<Box as='section' w='full' maxW='2xl'>
				<Flex mb={8} align='center' justify='space-between' direction='row' gap={3} wrap='wrap'>
					<Heading as='h1' textStyle='h2'>
						All my collections
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>Back to profile</NavLink>
					</Button>
				</Flex>

				<CollectionsSection
					profile={profile}
					collections={collections}
					myPoems={myPoems}
					savedPoems={savedPoems}
					isLoadingCollections={isLoadingCollections}
					isCreatingCollection={isCreatingCollection}
					isDeletingCollection={isDeletingCollection}
					isAddingCollectionItem={isAddingCollectionItem}
					isRemovingCollectionItem={isRemovingCollectionItem}
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
