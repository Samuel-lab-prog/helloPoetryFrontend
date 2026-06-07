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
	const {
		acceptRequest,
		rejectRequest,
		isAcceptingRequester,
		isRejectingRequester,
		isRemovingRequester,
		isHiddenRequester,
		errorMessage,
	} = useFriendRequestActions();
	const visibleRequests = {
		...filteredRequests,
		received: filteredRequests.received.filter(
			(request) => !isHiddenRequester(request.requesterId),
		),
	};

	if (!authClient?.id) return <ProfileAccessGate />;

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex mb={6} align='center' justify='space-between' direction='row' gap={3} wrap='wrap'>
					<Flex direction='column' gap={3} w='full' maxW={{ base: 'full', md: '360px' }}>
						<Heading as='h1' textStyle='h3'>
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
					friendRequests={visibleRequests}
					isFriendRequestsLoading={isFriendRequestsLoading}
					isFriendRequestsError={isFriendRequestsError}
					isSearchingFriendRequests={isSearching}
					isAccepting={isAcceptingRequester}
					isRejecting={isRejectingRequester}
					isRemovingRequester={isRemovingRequester}
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
