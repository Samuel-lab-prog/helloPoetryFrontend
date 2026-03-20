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
				All Poems
			</Heading>

			<Flex as='form' direction={['column', undefined, 'row']} gap={[4, undefined, 8]} w='full'>
				<SelectField label='Sort by' name='order' control={control} options={ORDER_OPTIONS} />
				<FormField label='Search poem' name='searchTitle' control={control} type='text' />
				<TagsField
					label='Filter by tags'
					name='tags'
					control={control}
					placeholder='Type and press Enter'
				/>
			</Flex>
		</Flex>
	);
}
