import { Button, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PoemCombobox } from '../../../public/components/PoemCombobox';
import { usePoemsMinimal } from '../../../public/hooks/useGetPoemsMinimal';
import { useDeletePoemForm } from '../hooks/delete-poem-form';

export function DeletePoemForm() {
	const { poems } = usePoemsMinimal();

	const {
		handleSubmit,
		onSubmit,
		formState: { isValid },
		control,
		watch,
		setValue,
		isPending,
		generalError,
	} = useDeletePoemForm();

	const poemId = watch('id');
	const [searchParams] = useSearchParams();
	const initialPoemId = Number(searchParams.get('poemId') ?? '');

	useEffect(() => {
		if (!initialPoemId || Number.isNaN(initialPoemId)) return;
		if (poemId) return;
		setValue('id', initialPoemId, { shouldValidate: true });
	}, [initialPoemId, poemId, setValue]);

	return (
		<Flex as='form' w='full' direction='column' gap={4} onSubmit={handleSubmit(onSubmit)}>
			{generalError && (
				<Text textStyle='smaller' color='red.400'>
					{generalError}
				</Text>
			)}

			<PoemCombobox name='id' poems={poems} control={control} />

			<Button
				type='submit'
				size='sm'
				variant='solidPink'
				colorPalette='gray'
				disabled={!isValid || isPending}
				loading={isPending}
				w={{ base: 'full', md: 'fit-content' }}
				alignSelf={{ base: 'stretch', md: 'flex-end' }}
				mt={2}
				px={6}
			>
				Delete Poem
			</Button>
		</Flex>
	);
}
