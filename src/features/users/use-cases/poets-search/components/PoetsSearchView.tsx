import { AsyncState, ErrorStateCard, SearchInput } from '@BaseComponents';
import { Box, Button, Flex, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchX, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { usePoetsSearch } from '../hooks/usePoetsSearch';
import { type SearchPoetsForm, searchPoetsSchema } from '../schemas/searchPoetsSchema';
import { LoadingUsersSkeletons } from './LoadingUsersSkeletons';
import { PoetCard } from './PoetCard';

const DEBOUNCE_DELAY_MS = 250;

function EmptyPoetsState({
	hasSearch,
	onClearSearch,
}: {
	hasSearch: boolean;
	onClearSearch?: () => void;
}) {
	return (
		<Box
			w='full'
			role='status'
			aria-live='polite'
			position='relative'
			overflow='hidden'
			borderRadius='2xl'
			border='1px solid'
			borderColor='purple.700'
			bgGradient='linear(to-br, rgba(42, 21, 57, 0.92), rgba(30, 20, 46, 0.98) 55%, rgba(25, 31, 58, 0.96))'
			p={{ base: 5, md: 6 }}
			shadow='0 12px 30px rgba(0,0,0,0.28)'
			_before={{
				content: '""',
				position: 'absolute',
				inset: '-40px auto auto -30px',
				w: '180px',
				h: '180px',
				borderRadius: 'full',
				bg: 'pink.500',
				filter: 'blur(70px)',
				opacity: 0.14,
			}}
			_after={{
				content: '""',
				position: 'absolute',
				inset: 'auto -50px -60px auto',
				w: '200px',
				h: '200px',
				borderRadius: 'full',
				bg: 'purple.500',
				filter: 'blur(75px)',
				opacity: 0.18,
			}}
		>
			<VStack align='start' gap={4} position='relative' zIndex={1}>
				<HStack
					px={3}
					py={2}
					borderRadius='full'
					bg='rgba(255, 255, 255, 0.06)'
					border='1px solid'
					borderColor='rgba(255, 255, 255, 0.08)'
					gap={2}
				>
					<Icon as={hasSearch ? SearchX : Users} boxSize={4.5} color='pink.200' />
					<Text
						textStyle='smaller'
						color='pink.200'
						letterSpacing='0.08em'
						textTransform='uppercase'
					>
						{hasSearch ? 'Search empty' : 'No poets yet'}
					</Text>
				</HStack>

				<VStack align='start' gap={2} w='full'>
					<Heading as='h2' textStyle='h4' color='white' mb={0}>
						{hasSearch ? 'No poets match this nickname' : 'This search is waiting for poets'}
					</Heading>
					<Text textStyle='smaller' color='pink.100'>
						{hasSearch
							? 'Try a different nickname or clear the search to browse all poets again.'
							: 'When poets appear, they will show up here in a clearer empty state.'}
					</Text>
				</VStack>

				{hasSearch && onClearSearch ? (
					<Button size='sm' variant='solidPink' onClick={onClearSearch} alignSelf='start'>
						<HStack gap={2}>
							<Icon as={X} boxSize={3.5} />
							<Text as='span'>Clear search</Text>
						</HStack>
					</Button>
				) : null}
			</VStack>
		</Box>
	);
}

export function PoetsSearchView() {
	const form = useForm<SearchPoetsForm>({
		defaultValues: {
			searchNickname: '',
		},
		mode: 'onChange',
		resolver: zodResolver(searchPoetsSchema),
	});

	const searchNickname = form.watch('searchNickname');
	const [debouncedSearch, setDebouncedSearch] = useState(searchNickname);

	const { poets, isLoading, isError } = usePoetsSearch(debouncedSearch);
	const authClient = useAuthClientStore((state) => state.authClient);
	const showSkeletons = isLoading && poets.length === 0;
	const visiblePoets = authClient ? poets.filter((poet) => poet.id !== authClient.id) : poets;

	return (
		<Flex direction='column' minH='100%'>
			<Flex
				as='main'
				layerStyle='mainPadded'
				direction='column'
				align='center'
				pb={{ base: 20, md: 12 }}
				flex='1'
				w='full'
				maxW='2xl'
				mx='auto'
			>
				<VStack as='section' w='full' align='stretch' gap={{ base: 0 }}>
					<Box mx='4'>
						<SearchInput
							label='Search poets'
							value={searchNickname}
							onValueChange={(value) => form.setValue('searchNickname', value)}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by nickname'
							debounceMs={DEBOUNCE_DELAY_MS}
						/>
					</Box>

					<Box mt={{ base: 0, md: 0 }} w='full'>
						<AsyncState
							isLoading={showSkeletons}
							isError={isError}
							isEmpty={visiblePoets.length === 0}
							loadingElement={LoadingUsersSkeletons}
							errorElement={
								<ErrorStateCard
									eyebrow='SEARCH UNAVAILABLE'
									title='We could not search poets right now.'
									description='Please try again in a moment, or refresh the page to reconnect.'
									actionLabel='Refresh search'
									onAction={() => window.location.reload()}
								/>
							}
							emptyElement={
								<Box mt={4} w='full'>
									<EmptyPoetsState
										hasSearch={debouncedSearch.trim().length > 0}
										onClearSearch={() => {
											form.setValue('searchNickname', '');
											setDebouncedSearch('');
										}}
									/>
								</Box>
							}
						>
							<Flex direction='column' gap={3} w='full' mb={6} mt={4}>
								{visiblePoets.map((poet, index) => (
									<Box
										key={poet.id}
										animationName='slide-from-bottom, fade-in'
										animationDuration='320ms'
										animationTimingFunction='ease-out'
										animationFillMode='backwards'
										animationDelay={`${30 + index * 30}ms`}
										borderTop='1px solid'
										borderColor='purple.700'
										w='full'
										_first={{ borderTop: 'none' }}
									>
										<PoetCard poet={poet} />
									</Box>
								))}
							</Flex>
						</AsyncState>
					</Box>
				</VStack>
			</Flex>
		</Flex>
	);
}
