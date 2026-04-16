import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Box, Field, Flex, Input, Text } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearch(searchNickname);
		}, DEBOUNCE_DELAY_MS);

		return () => window.clearTimeout(timeoutId);
	}, [searchNickname]);

	const { poets, isLoading, isError } = usePoetsSearch(debouncedSearch);
	const authClient = useAuthClientStore((state) => state.authClient);
	const showSkeletons = isLoading && poets.length === 0;
	const visiblePoets = authClient ? poets.filter((poet) => poet.id !== authClient.id) : poets;

	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
			align='center'
			py={4}
			w='full'
			maxW='2xl'
			mx='auto'
		>
			<Flex as='section' direction='column' w='full' mb={3} p={4}>
				<Field.Root pb={4}>
					<Field.Label textStyle='small' fontWeight='medium' color='text'>
						Search poets
					</Field.Label>
					<Input
						value={searchNickname}
						onChange={(event) => form.setValue('searchNickname', event.target.value)}
						placeholder='Search by nickname'
						textStyle='small'
						transition='all 0.22s ease'
						bg='rgba(255, 255, 255, 0.03)'
						borderColor='border'
						_hover={{
							borderColor: 'borderHover',
							bg: 'rgba(255, 255, 255, 0.05)',
						}}
						_focusVisible={{
							borderColor: 'pink.300',
							boxShadow: '0 0 0 3px rgba(255, 143, 189, 1)',
							bg: 'rgba(255, 255, 255, 0.06)',
						}}
						_focus={{
							borderColor: 'pink.300',
							bg: 'rgba(255, 255, 255, 0.06)',
						}}
					/>
				</Field.Root>
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
					<Text textStyle='body' px={4}>
						No poets found.
					</Text>
				}
			>
				<Flex direction='column' gap={3} w='full' px={4} mb={6}>
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
