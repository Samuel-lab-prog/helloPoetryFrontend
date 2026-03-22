import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text } from '@chakra-ui/react';
import { AsyncState } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { useMyProfile } from '../hooks/useMyProfile';
import { useMyFriendRequests } from '../hooks/useMyFriendRequests';
import { useUpdateMyProfile } from '../hooks/useUpdateMyProfile';
import { useFriendRequestActions } from '@features/interactions';
import { useMyPoems } from '@root/features/poems/public/hooks/useGetMyPoems';
import { usePoemCollections } from '@root/features/poems/public/hooks/useManagePoemCollections';
import { useSavedPoems } from '@root/features/poems/public/hooks/useManageSavedPoems';
import { eventBus } from '@root/core/events/eventBus';
import { ProfileAccessGate } from '../components/my-profile/ProfileAccessGate';
import { ProfileHeader } from '../components/my-profile/ProfileHeader';
import { ProfileOverviewSection } from '../components/my-profile/ProfileOverviewSection';
import { FriendRequestsSection } from '../components/my-profile/FriendRequestsSection';
import { MyPoemsSection } from '../components/my-profile/MyPoemsSection';
import { CollectionsSection } from '../components/my-profile/CollectionsSection';
import { SavedPoemsSection } from '../components/my-profile/SavedPoemsSection';

export function MyProfilePage() {
	const navigate = useNavigate();
	const clearAuthClient = useAuthClientStore((state) => state.clearAuthClient);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const { profile, isLoading, isError, isMissingClient } = useMyProfile();
	const { updateMyProfile, isUpdatingProfile, updateProfileError, conflictField } =
		useUpdateMyProfile();
	const {
		requests: friendRequests,
		isLoading: isFriendRequestsLoading,
		isError: isFriendRequestsError,
	} = useMyFriendRequests(!isMissingClient);
	const { acceptRequest, rejectRequest, isAccepting, isRejecting, errorMessage } =
		useFriendRequestActions();
	const {
		poems: myPoems,
		isLoading: isLoadingMyPoems,
		isError: isMyPoemsError,
	} = useMyPoems(!isMissingClient);
	const { savedPoems, isLoadingSavedPoems, unsavePoem, isSavingPoem, saveError } =
		useSavedPoems(!isMissingClient);
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

	if (isLoggingOut) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<Text textStyle='body'>Saindo...</Text>
			</Flex>
		);
	}

	if (isMissingClient) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	function handleLogout() {
		if (isLoggingOut) return;
		setIsLoggingOut(true);
		const authClient = useAuthClientStore.getState().authClient;
		navigate('/login', { replace: true });
		clearAuthClient();
		void eventBus.publish('userLoggedOut', {
			userId: authClient?.id ?? null,
			reason: 'manual',
			loggedOutAt: new Date().toISOString(),
		});
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='4xl'>
				<ProfileHeader isLoggingOut={isLoggingOut} onLogout={handleLogout} />

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={!profile}
					loadingElement={<Text textStyle='body'>Carregando perfil...</Text>}
					errorElement={<Text textStyle='body'>Erro ao carregar perfil.</Text>}
					emptyElement={<Text textStyle='body'>Perfil não encontrado.</Text>}
				>
					{profile && (
						<Flex direction='column' gap={6}>
							<Box
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay='30ms'
							>
								<ProfileOverviewSection
									profile={profile}
									isUpdatingProfile={isUpdatingProfile}
									updateProfileError={updateProfileError}
									conflictField={conflictField}
									onUpdateProfile={async (input) => {
										await updateMyProfile(input);
									}}
								/>
							</Box>

							<Box
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay='60ms'
							>
								<FriendRequestsSection
									friendRequests={{
										...friendRequests,
										received: friendRequests.received.slice(0, 3),
									}}
									viewAllHref='/my-profile/friend-requests'
									isFriendRequestsLoading={isFriendRequestsLoading}
									isFriendRequestsError={isFriendRequestsError}
									isAccepting={isAccepting}
									isRejecting={isRejecting}
									errorMessage={errorMessage}
									onAcceptRequest={(requesterId) => {
										void acceptRequest(requesterId);
									}}
									onRejectRequest={(requesterId) => {
										void rejectRequest(requesterId);
									}}
								/>
							</Box>

							<Box
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay='90ms'
							>
								<MyPoemsSection
									myPoems={myPoems.slice(0, 3)}
									totalPoemsCount={myPoems.length}
									viewAllHref='/my-profile/poems'
									isLoadingMyPoems={isLoadingMyPoems}
									isMyPoemsError={isMyPoemsError}
									onOpenPoem={(slug, id) => navigate(`/poems/${slug}/${id}`)}
									onUpdatePoem={(id) => navigate(`/admin?mode=update&poemId=${id}`)}
									onDeletePoem={(id) => navigate(`/admin?mode=delete&poemId=${id}`)}
								/>
							</Box>

							<Box
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay='120ms'
							>
								<CollectionsSection
									profile={profile}
									collections={collections.slice(0, 3)}
									totalCollectionsCount={collections.length}
									viewAllHref='/my-profile/collections'
									showManagementControls={false}
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

							<Box
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay='150ms'
							>
								<SavedPoemsSection
									savedPoems={savedPoems.slice(0, 3)}
									totalSavedPoemsCount={savedPoems.length}
									viewAllHref='/my-profile/saved-poems'
									isLoadingSavedPoems={isLoadingSavedPoems}
									isSavingPoem={isSavingPoem}
									saveError={saveError}
									onUnsavePoem={unsavePoem}
								/>
							</Box>
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}
