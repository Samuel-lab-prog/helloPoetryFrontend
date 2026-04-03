import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SearchInput } from '@root/core/base';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { useSavedPoems } from '@root/features/poems/public/hooks/useManageSavedPoems';
import { ProfileAccessGate } from '../../components/my-profile/ProfileAccessGate';
import { SavedPoemsSection } from '../../components/my-profile/SavedPoemsSection';

export function MyProfileSavedPoemsPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const { savedPoems, isLoadingSavedPoems, unsavePoem, isSavingPoem, saveError } = useSavedPoems(
		Boolean(authClient?.id),
	);
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
					align='center'
					justify='space-between'
					direction='row'
					gap={3}
					wrap='wrap'
				>
					<Flex direction='column' gap={3} w='full' maxW={{ base: 'full', md: '360px' }}>
						<Heading as='h1' textStyle='h2'>
							All saved poems
						</Heading>
						<SearchInput
							label='Search saved poems'
							value={searchTitle}
							onValueChange={setSearchTitle}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by title'
						/>
					</Flex>
					<Button
						size={{ base: 'sm', md: 'md' }}
						variant='solidPink'
						colorPalette='gray'
						ms={{ base: 'auto', md: 0 }}
						asChild
					>
						<NavLink to='/my-profile'>Back to profile</NavLink>
					</Button>
				</Flex>

				<SavedPoemsSection
					savedPoems={filteredSavedPoems}
					isLoadingSavedPoems={isLoadingSavedPoems}
					isSavingPoem={isSavingPoem}
					saveError={saveError}
					isSearchingSavedPoems={isSearching}
					onUnsavePoem={unsavePoem}
				/>
			</Box>
		</Flex>
	);
}
