import { AsyncState, EmptyStateCard, ErrorStateCard, SearchInput } from '@BaseComponents';
import { Box, Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
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
				px={0}
				pb={{ base: 20, md: 12 }}
				flex='1'
				w='full'
				maxW='2xl'
				mx='auto'
			>
				<VStack as='section' w='full' align='stretch' gap={{ base: 0 }}>
					<Box px={4}>
						<SearchInput
							label='Search poets'
							value={searchNickname}
							onValueChange={(value) => form.setValue('searchNickname', value)}
							onDebouncedChange={setDebouncedSearch}
							placeholder='Search by nickname'
							debounceMs={DEBOUNCE_DELAY_MS}
						/>
					</Box>

					<Box mt={4} w='full'>
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
								<Box mt={4} px={4}>
									<EmptyStateCard
										eyebrow={debouncedSearch.trim().length > 0 ? 'Search empty' : 'No poets yet'}
										eyebrowIcon={debouncedSearch.trim().length > 0 ? SearchX : Users}
										title={
											debouncedSearch.trim().length > 0
												? 'No poets match this nickname'
												: 'This search is waiting for poets'
										}
										description={
											debouncedSearch.trim().length > 0
												? 'Try a different nickname or clear the search to browse all poets again.'
												: 'When poets appear, they will show up here in a clearer empty state.'
										}
										action={
											debouncedSearch.trim().length > 0 ? (
												<Button
													size='sm'
													variant='solidPink'
													onClick={() => {
														form.setValue('searchNickname', '');
														setDebouncedSearch('');
													}}
												>
													<HStack gap={2}>
														<Icon as={X} boxSize={3.5} />
														<Text as='span'>Clear search</Text>
													</HStack>
												</Button>
											) : null
										}
										actionAlign='start'
									/>
								</Box>
							}
						>
							<Flex direction='column' gap={0} w='full'>
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
										pt={0}
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
