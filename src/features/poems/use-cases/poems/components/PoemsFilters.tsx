import { Flex, Heading } from '@chakra-ui/react';
import { FormField, SelectField, TagsField } from '@root/core/base';
import { ORDER_OPTIONS } from '../constants';
import type { UsePoemFiltersReturn } from '../types';

type PoemsFiltersProps = {
	filters: UsePoemFiltersReturn;
};

export function PoemsFilters({ filters }: PoemsFiltersProps) {
	const { control } = filters;

	return (
		<Flex as='section' mb={6} gap={8} direction='column' w='full'>
			<Heading as='h1' textStyle='h2'>
				Todos os Poemas
			</Heading>

			<Flex as='form' direction={['column', undefined, 'row']} gap={[4, undefined, 8]} w='full'>
				<SelectField label='Ordenar por' name='order' control={control} options={ORDER_OPTIONS} />
				<FormField label='Buscar poema' name='searchTitle' control={control} type='text' />
				<TagsField
					label='Filtrar por tags'
					name='tags'
					control={control}
					placeholder='Digite e pressione Enter'
				/>
			</Flex>
		</Flex>
	);
}
