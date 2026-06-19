import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { getBannedPrivilegeMessage, isBannedAccessError } from '@features/auth/public';
import { useMyPoems } from '@features/poems/public/hooks/useGetMyPoems';
import { usePoemCollections } from '@features/poems/public/hooks/useManagePoemCollections';
import { useSavedPoems } from '@features/poems/public/hooks/useManageSavedPoems';
import { ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { CollectionsSection } from '../../public/components/my-profile/CollectionsSection';
import { ProfileAccessGate } from '../../public/components/my-profile/ProfileAccessGate';
import { useMyProfile } from '../../public/hooks/useMyProfile';
import { LoadingMyProfileSkeleton } from '../my-profile/components/skeletons/LoadingMyProfileSkeleton';

export function MyProfileCollectionsPage() {
	const {
		profile,
		isMissingClient,
		isLoading: isProfileLoading,
		isError: isProfileError,
		error: profileError,
		refetch: refetchProfile,
	} = useMyProfile();
	const {
		collections,
		isLoadingCollections,
		isCollectionsError,
		collectionsLoadError,
		refetchCollections,
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
	const isBannedProfileError = isBannedAccessError(profileError);
	const isBannedCollectionsError = isCollectionsError && isBannedAccessError(collectionsLoadError);
	const isProfileUnavailable = isProfileError || isBannedProfileError;

	if (isMissingClient) {
		return <ProfileAccessGate />;
	}

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
			<Box as='section' w='full' maxW='2xl'>
				<AsyncState
					isLoading={isProfileLoading}
					isError={isProfileUnavailable}
					isEmpty={!profile}
					loadingElement={LoadingMyProfileSkeleton}
					errorElement={
						<ErrorStateCard
							eyebrow='PROFILE UNAVAILABLE'
							title={
								isBannedProfileError
									? 'Profile access is unavailable for this account'
									: 'We could not load your profile right now.'
							}
							description={
								isBannedProfileError
									? getBannedPrivilegeMessage('view profiles')
									: 'Please try again in a moment, or retry the request to reconnect.'
							}
							actionLabel={isBannedProfileError ? undefined : 'Retry profile'}
							onAction={
								isBannedProfileError
									? undefined
									: () => {
											void refetchProfile();
										}
							}
						/>
					}
					emptyElement={<Text textStyle='body'>Profile not found.</Text>}
				>
					{profile && (
						<Flex direction='column' gap={6}>
							<Flex
								mb={6}
								align='center'
								justify='space-between'
								direction='row'
								gap={3}
								wrap='wrap'
							>
								<Heading as='h1' textStyle='h3'>
									All my collections
								</Heading>
								<Button
									aria-label='Back to profile'
									title='Back to profile'
									size='sm'
									variant='solidPink'
									colorPalette='gray'
									minW='40px'
									px={0}
									asChild
								>
									<NavLink to='/my-profile'>
										<ArrowLeft size={16} />
									</NavLink>
								</Button>
							</Flex>

							{isCollectionsError && collections.length === 0 && (
								<ErrorStateCard
									eyebrow='COLLECTIONS UNAVAILABLE'
									title={
										isBannedCollectionsError
											? 'Collections are unavailable for this account'
											: 'We could not load your collections right now.'
									}
									description={
										collectionsError || 'Your collections are safe. Please try again in a moment.'
									}
									actionLabel={isBannedCollectionsError ? undefined : 'Retry collections'}
									onAction={
										isBannedCollectionsError
											? undefined
											: () => {
													void refetchCollections();
												}
									}
								/>
							)}

							{(!isCollectionsError || collections.length > 0) && (
								<CollectionsSection
									profile={profile}
									collections={collections}
									showCreateCollectionForm={true}
									showPoems={true}
									showAddPoemForm={true}
									myPoems={myPoems}
									savedPoems={savedPoems}
									isLoadingCollections={isLoadingCollections}
									isCreatingCollection={isCreatingCollection}
									isDeletingCollection={isDeletingCollection}
									isAddingCollectionItem={isAddingCollectionItem}
									isRemovingCollectionItem={isRemovingCollectionItem}
									collectionsError=''
									onCreateCollection={createCollection}
									onDeleteCollection={deleteCollection}
									onAddPoemToCollection={addPoemToCollection}
									onRemovePoemFromCollection={removePoemFromCollection}
									showHeader={false}
									withSurface={false}
								/>
							)}
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}
