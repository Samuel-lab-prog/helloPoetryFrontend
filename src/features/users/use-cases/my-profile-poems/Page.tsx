import { SearchInput } from '@BaseComponents';
import { Box, Button, Flex, Heading, HStack } from '@chakra-ui/react';
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
	} = useMyPoems(Boolean(authClient?.id));
	const [searchTitle, setSearchTitle] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const isSearching = debouncedSearch.trim().length > 0;

	const filteredPoems = useMemo(() => {
		if (!isSearching) return myPoems;
		const normalized = debouncedSearch.trim().toLowerCase();
		return myPoems.filter((poem) => poem.title.toLowerCase().includes(normalized));
	}, [debouncedSearch, isSearching, myPoems]);

	if (!authClient?.id) return <ProfileAccessGate />;

	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
			align='center'
			py={12}
			px={[4, 4, 0]}
		>
			<Box as='section' w='full' maxW='5xl'>
				<Flex mb={8} align='center' justify='space-between' direction='row' gap={3} wrap='wrap'>
					<Flex direction='column' gap={3} w='full' maxW={{ base: 'full', md: '360px' }}>
						<Heading as='h1' textStyle='h2'>
							All my poems
						</Heading>
						<SearchInput
							label='Search poems'
							value={searchTitle}
							onValueChange={setSearchTitle}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by title'
							debounceMs={150}
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

				<MyPoemsSection
					myPoems={filteredPoems}
					isLoadingMyPoems={isLoadingMyPoems}
					isMyPoemsError={isMyPoemsError}
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
