import { SearchInput } from '@BaseComponents';
import { Box, Button, Field, Flex, Heading, NativeSelect } from '@chakra-ui/react';
import { getBannedPrivilegeMessage, isBannedAccessError } from '@features/auth/public';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useMyPoems } from '@features/poems/public/hooks/useGetMyPoems';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';

import { MyPoemsSection } from '../../public/components/my-profile/MyPoemsSection';
import {
	filterAndSortMyPoems,
	type MyPoemsStatusFilter,
} from '../../public/components/my-profile/myPoemsUtils';
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
	const [searchParams, setSearchParams] = useSearchParams();
	const requestedStatus = searchParams.get('status');
	const statusFilter: MyPoemsStatusFilter =
		requestedStatus === 'draft' || requestedStatus === 'published' ? requestedStatus : 'all';
	const isSearching = debouncedSearch.trim().length > 0;
	const draftCount = myPoems.filter((poem) => poem.status === 'draft').length;
	const publishedCount = myPoems.length - draftCount;

	const filteredPoems = useMemo(
		() => filterAndSortMyPoems(myPoems, statusFilter, debouncedSearch),
		[debouncedSearch, myPoems, statusFilter],
	);
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
					<Flex gap={3} align='end' direction={{ base: 'column', md: 'row' }}>
						<Box w='full' flex='1' maxW={{ base: 'full', md: '420px' }}>
							<SearchInput
								label='Search poems'
								value={searchTitle}
								onValueChange={setSearchTitle}
								onDebouncedChange={setDebouncedSearch}
								placeholder='Search by title'
								debounceMs={150}
							/>
						</Box>
						<Box w={{ base: 'full', md: '220px' }}>
							<Field.Root>
								<Field.Label textStyle='smaller' mb={1}>
									Filter by status
								</Field.Label>
								<NativeSelect.Root>
									<NativeSelect.Field
										id='my-poems-status'
										aria-label='Filter poems by status'
										value={statusFilter}
										onChange={(event) => {
											const nextParams = new URLSearchParams(searchParams);
											if (event.target.value === 'all') nextParams.delete('status');
											else nextParams.set('status', event.target.value);
											setSearchParams(nextParams, { replace: true });
										}}
									>
										<option value='all'>
											{isLoadingMyPoems ? 'All poems' : `All poems (${myPoems.length})`}
										</option>
										<option value='draft'>
											{isLoadingMyPoems ? 'Drafts' : `Drafts (${draftCount})`}
										</option>
										<option value='published'>
											{isLoadingMyPoems ? 'Published' : `Published (${publishedCount})`}
										</option>
									</NativeSelect.Field>
									<NativeSelect.Indicator />
								</NativeSelect.Root>
							</Field.Root>
						</Box>
					</Flex>
				</Flex>

				<MyPoemsSection
					myPoems={filteredPoems}
					searchAnimationKey={debouncedSearch.trim().toLowerCase() || 'all'}
					isLoadingMyPoems={isLoadingMyPoems}
					isMyPoemsError={isMyPoemsUnavailable}
					myPoemsErrorMessage={myPoemsErrorMessage}
					isSearchingMyPoems={isSearching}
					emptyMessage={getEmptyMessage(statusFilter, isSearching)}
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

function getEmptyMessage(status: MyPoemsStatusFilter, isSearching: boolean) {
	if (status === 'draft')
		return isSearching ? 'No drafts match your search.' : 'You have no drafts yet.';
	if (status === 'published') {
		return isSearching
			? 'No published poems match your search.'
			: 'You have no published poems yet.';
	}
	if (isSearching) return 'No poems found for your search.';
	return 'You have not created any poems yet.';
}
