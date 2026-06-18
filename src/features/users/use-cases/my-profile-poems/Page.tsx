import { SearchInput } from '@BaseComponents';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { getBannedPrivilegeMessage, isBannedAccessError } from '@features/auth/public';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useMyPoems } from '@features/poems/public/hooks/useGetMyPoems';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { MyPoemsSection } from '../../public/components/my-profile/MyPoemsSection';
import { ProfileAccessGate } from '../../public/components/my-profile/ProfileAccessGate';

export function MyProfilePoemsPage() {
	const navigate = useNavigate();
	const authClient = useAuthClientStore((state) => state.authClient);
	const {
		poems: myPoems,
		isLoading: isLoadingMyPoems,
		isError: isMyPoemsError,
		error: myPoemsError,
	} = useMyPoems(Boolean(authClient?.id));
	const [searchTitle, setSearchTitle] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const isSearching = debouncedSearch.trim().length > 0;

	const filteredPoems = useMemo(() => {
		if (!isSearching) return myPoems;
		const normalized = debouncedSearch.trim().toLowerCase();
		return myPoems.filter((poem) => poem.title.toLowerCase().includes(normalized));
	}, [debouncedSearch, isSearching, myPoems]);
	const myPoemsErrorMessage = isBannedAccessError(myPoemsError)
		? getBannedPrivilegeMessage('view your poems')
		: undefined;
	const isMyPoemsUnavailable = isMyPoemsError || isBannedAccessError(myPoemsError);

	if (!authClient?.id) return <ProfileAccessGate />;

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex mb={6} direction='column' gap={4}>
					<Flex align='center' justify='space-between' gap={3} wrap='wrap'>
						<Heading as='h1' textStyle='h3'>
							All my poems
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
					<Box w='full' maxW={{ base: 'full', md: '360px' }} pb={[0, 2]}>
						<SearchInput
							label='Search poems'
							value={searchTitle}
							onValueChange={setSearchTitle}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by title'
							debounceMs={150}
						/>
					</Box>
				</Flex>

				<MyPoemsSection
					myPoems={filteredPoems}
					searchAnimationKey={debouncedSearch.trim().toLowerCase() || 'all'}
					isLoadingMyPoems={isLoadingMyPoems}
					isMyPoemsError={isMyPoemsUnavailable}
					myPoemsErrorMessage={myPoemsErrorMessage}
					isSearchingMyPoems={isSearching}
					onOpenPoem={(slug, id) => navigate(`/poems/${slug}/${id}`)}
					onUpdatePoem={(id) => navigate(`/admin?mode=update&poemId=${id}`)}
					onDeletePoem={(id) => navigate(`/admin?mode=delete&poemId=${id}`)}
					showHeader={false}
					withSurface={false}
				/>
			</Box>
		</Flex>
	);
}
