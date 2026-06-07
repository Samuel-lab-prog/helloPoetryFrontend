import { AsyncState, ErrorStateCard, SearchInput } from '@BaseComponents';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { zodResolver } from '@hookform/resolvers/zod';
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
		<Flex
			as='main'
			layerStyle='mainPadded'
			direction='column'
			align='center'
			w='full'
			maxW='2xl'
			mx='auto'
		>
			<Flex as='section' direction='column' w='full' mb={4}>
				<SearchInput
					label='Search poets'
					value={searchNickname}
					onValueChange={(value) => form.setValue('searchNickname', value)}
					onDebouncedChange={setDebouncedSearch}
					placeholder='Search by nickname'
					debounceMs={DEBOUNCE_DELAY_MS}
				/>
			</Flex>

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
					<Text textStyle='small' px={4}>
						No poets found.
					</Text>
				}
			>
				<Flex direction='column' gap={3} w='full' mb={6}>
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
		</Flex>
	);
}
