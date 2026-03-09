import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
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

	const { poets, isLoading, isError } = usePoetsSearch(debouncedSearch);

	return (
		<Flex as='main' layerStyle='main' direction='column'>
			<Flex as='section'  gap={3} direction='column' w='full'>
				<Heading as='h1' textStyle='h2'>
					Buscar Poetas
				</Heading>
				<Text textStyle='small' color='pink.200'>
					Encontre outros poetas por nickname.
				</Text>
				<FormField
					label='Pesquisar por nickname'
					name='searchNickname'
					control={form.control}
					type='text'
				/>
			</Flex>

			<AsyncState
				isLoading={isLoading}
				isError={isError}
				isEmpty={poets.length === 0}
				loadingElement={<Text textStyle='body'>Buscando poetas...</Text>}
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
