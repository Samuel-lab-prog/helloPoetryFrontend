import { useEffect, useState } from 'react';
import { Box, Card, Flex, Skeleton, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AsyncState, FormField } from '@root/core/base';
import { useMyProfile } from '../hooks/useMyProfile';
import { usePoetsSearch } from '../../poems/public/hooks/useGetPoetsSearch';
import { PoetCard } from '../components/PoetCard';

type SearchForm = {
	searchNickname: string;
};

export function PoetsPage() {
	const form = useForm<SearchForm>({
		defaultValues: {
			searchNickname: '',
		},
		mode: 'onChange',
	});

	const searchNickname = form.watch('searchNickname');
	const [debouncedSearch, setDebouncedSearch] = useState(searchNickname);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearch(searchNickname);
		}, 250);

		return () => window.clearTimeout(timeoutId);
	}, [searchNickname]);

	const { poets, isLoading, isFetching, isError } = usePoetsSearch(debouncedSearch);
	const { profile } = useMyProfile();
	const showSkeletons = isLoading && poets.length === 0;
	const visiblePoets = profile ? poets.filter((poet) => poet.id !== profile.id) : poets;

	const loadingSkeletons = (
		<Flex direction='column' gap={3}>
			{Array.from({ length: 4 }).map((_, index) => (
				<Card.Root key={`poet-skeleton-${index}`} variant='interactive'>
					<Card.Body>
						<Flex align='center' justify='space-between' gap={2}>
							<Flex align='center' gap={3}>
								<Skeleton boxSize='12' borderRadius='full' />
								<Flex direction='column' gap={2}>
									<Skeleton height='12px' width='140px' />
									<Skeleton height='10px' width='90px' />
								</Flex>
							</Flex>
							<Skeleton height='28px' width='96px' borderRadius='md' />
						</Flex>
					</Card.Body>
				</Card.Root>
			))}
		</Flex>
	);

	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
			w='full'
			maxW='4xl'
			mx='auto'
			px={{ base: 4, md: 6 }}
		>
			<Flex as='section' gap={4} direction='column' w='full' mb={6}>
				<FormField
					label='Search by nickname'
					name='searchNickname'
					control={form.control}
					type='text'
				/>
				{isFetching && (
					<Text textStyle='smaller' color='pink.200'>
						Searching poets...
					</Text>
				)}
			</Flex>

			<AsyncState
				isLoading={showSkeletons}
				isError={isError}
				isEmpty={visiblePoets.length === 0}
				loadingElement={loadingSkeletons}
				errorElement={<Text textStyle='body'>Error searching poets.</Text>}
				emptyElement={<Text textStyle='body'>No poets found.</Text>}
			>
				<Flex direction='column' gap={3}>
					{visiblePoets.map((poet, index) => (
						<Box
							key={poet.id}
							animationName='slide-from-bottom, fade-in'
							animationDuration='320ms'
							animationTimingFunction='ease-out'
							animationFillMode='backwards'
							animationDelay={`${30 + index * 30}ms`}
						>
							<PoetCard poet={poet} />
						</Box>
					))}
				</Flex>
			</AsyncState>
		</Flex>
	);
}
