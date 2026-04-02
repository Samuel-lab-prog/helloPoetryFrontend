import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { useFriendRequestActions } from '@features/interactions';
import { ProfileAccessGate } from '../components/my-profile/ProfileAccessGate';
import { FriendRequestsSection } from '../components/my-profile/FriendRequestsSection';
import { useMyFriendRequests } from '../hooks/useMyFriendRequests';

export function MyProfileFriendRequestsPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const {
		requests: friendRequests,
		isLoading: isFriendRequestsLoading,
		isError: isFriendRequestsError,
	} = useMyFriendRequests(Boolean(authClient?.id));
	const { acceptRequest, rejectRequest, isAccepting, isRejecting, errorMessage } =
		useFriendRequestActions();

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
						All my requests
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>Back to profile</NavLink>
					</Button>
				</Flex>

				<FriendRequestsSection
					friendRequests={friendRequests}
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
		</Flex>
	);
}
