import { useEffect, useState } from 'react';
import { Box, Card, Flex, Heading, Skeleton, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AsyncState, FormField } from '@features/base';
import { usePoetsSearch } from '../../poems/hooks/usePoetsSearch';
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
	const showSkeletons = isLoading && poets.length === 0;

	const loadingSkeletons = (
		<Flex direction='column' gap={3}>
			{Array.from({ length: 6 }).map((_, index) => (
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
		<Flex as='main' layerStyle='main' direction='column' w='4xl' mx='auto'>
			
			<Flex as='section' gap={4} direction='column' w='full' mb={6}>
				<Heading as='h1' textStyle='h2'>
					Buscar Poetas
				</Heading>
				<Text textStyle='small' color='pink.200' mt={-1}>
					Encontre outros poetas por nickname.
				</Text>
				<FormField
					label='Pesquisar por nickname'
					name='searchNickname'
					control={form.control}
					type='text'
				/>
				{isFetching && (
					<Text textStyle='smaller' color='pink.200'>
						Buscando poetas...
					</Text>
				)}
			</Flex>

			<AsyncState
				isLoading={showSkeletons}
				isError={isError}
				isEmpty={poets.length === 0}
				loadingElement={loadingSkeletons}
				errorElement={<Text textStyle='body'>Erro ao buscar poetas.</Text>}
				emptyElement={<Text textStyle='body'>Nenhum poeta encontrado.</Text>}
			>
				<Flex direction='column' gap={3}>
					{poets.map((poet, index) => (
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
