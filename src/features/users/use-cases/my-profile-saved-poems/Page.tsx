import { SearchInput } from '@BaseComponents';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useSavedPoems } from '@features/poems/public/hooks/useManageSavedPoems';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { ProfileAccessGate } from '../../public/components/my-profile/ProfileAccessGate';
import { SavedPoemsSection } from '../../public/components/my-profile/SavedPoemsSection';

export function MyProfileSavedPoemsPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const {
		savedPoems,
		isLoadingSavedPoems,
		unsavePoem,
		isSavingPoem,
		saveError,
		updatingSavedPoemId,
	} = useSavedPoems(Boolean(authClient?.id));
	const [searchTitle, setSearchTitle] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const isSearching = debouncedSearch.trim().length > 0;

	const filteredSavedPoems = useMemo(() => {
		if (!isSearching) return savedPoems;
		const normalized = debouncedSearch.trim().toLowerCase();
		return savedPoems.filter((poem) => poem.title.toLowerCase().includes(normalized));
	}, [debouncedSearch, isSearching, savedPoems]);

	if (!authClient?.id) {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex mb={6} direction='column' gap={4}>
					<Flex align='center' justify='space-between' gap={3} wrap='wrap'>
						<Heading as='h1' textStyle='h3'>
							All saved poems
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
							label='Search saved poems'
							value={searchTitle}
							onValueChange={setSearchTitle}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by title'
						/>
					</Box>
				</Flex>

				<SavedPoemsSection
					savedPoems={filteredSavedPoems}
					isLoadingSavedPoems={isLoadingSavedPoems}
					isSavingPoem={isSavingPoem}
					saveError={saveError}
					isSearchingSavedPoems={isSearching}
					onUnsavePoem={unsavePoem}
					updatingSavedPoemId={updatingSavedPoemId}
					showHeader={false}
					withSurface={false}
				/>
			</Box>
		</Flex>
	);
}
