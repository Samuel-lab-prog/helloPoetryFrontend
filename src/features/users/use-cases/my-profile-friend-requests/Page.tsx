import { SearchInput } from '@BaseComponents';
import { Box, Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useFriendRequestActions } from '@features/interactions/public';
import { useMyFriendRequests } from '@features/users/public/hooks/useMyFriendRequests';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { FriendRequestsSection } from '../../public/components/my-profile/FriendRequestsSection';
import { ProfileAccessGate } from '../../public/components/my-profile/ProfileAccessGate';

export function MyProfileFriendRequestsPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const {
		requests: friendRequests,
		isLoading: isFriendRequestsLoading,
		isError: isFriendRequestsError,
	} = useMyFriendRequests(Boolean(authClient?.id));
	const [searchName, setSearchName] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const isSearching = debouncedSearch.trim().length > 0;

	const filteredRequests = useMemo(() => {
		if (!isSearching) return friendRequests;
		const normalized = debouncedSearch.trim().toLowerCase();
		return {
			...friendRequests,
			received: friendRequests.received.filter((request) => {
				const name = request.requesterName.toLowerCase();
				const nickname = request.requesterNickname.toLowerCase();
				return name.includes(normalized) || nickname.includes(normalized);
			}),
		};
	}, [debouncedSearch, friendRequests, isSearching]);
	const { acceptRequest, rejectRequest, isAccepting, isRejecting, errorMessage } =
		useFriendRequestActions();

	if (!authClient?.id) return <ProfileAccessGate />;

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center' py={12} px={[4, 4, 0]}>
			<Box as='section' w='full' maxW='5xl'>
				<Flex mb={8} align='center' justify='space-between' direction='row' gap={3} wrap='wrap'>
					<Flex direction='column' gap={3} w='full' maxW={{ base: 'full', md: '360px' }}>
						<Heading as='h1' textStyle='h2'>
							All my requests
						</Heading>
						<SearchInput
							label='Search requests'
							value={searchName}
							onValueChange={setSearchName}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by name or nickname'
						/>
					</Flex>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>
							<HStack gap={2}>
								<ArrowLeft size={16} />
								<span>Back to profile</span>
							</HStack>
						</NavLink>
					</Button>
				</Flex>

				<FriendRequestsSection
					friendRequests={filteredRequests}
					isFriendRequestsLoading={isFriendRequestsLoading}
					isFriendRequestsError={isFriendRequestsError}
					isSearchingFriendRequests={isSearching}
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
