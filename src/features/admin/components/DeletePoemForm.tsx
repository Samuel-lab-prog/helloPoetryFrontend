import { Flex, Button, Text } from '@chakra-ui/react';
import { useDeletePoemForm } from '../hooks/delete-poem-form';
import { usePoemsMinimal } from '../hooks/usePoemsMinimal';
import { PoemCombobox } from '@features/poems';

export function DeletePoemForm() {
	const { poems } = usePoemsMinimal();

	const {
		handleSubmit,
		onSubmit,
		formState: { isValid },
		control,
		isPending,
		generalError,
	} = useDeletePoemForm();

	return (
		<Flex as='form' w='full' direction='column' gap={6} onSubmit={handleSubmit(onSubmit)}>
			{generalError && <Text color='red.500'>{generalError}</Text>}

			<PoemCombobox name='id' poems={poems} control={control} />

			<Button
				type='submit'
				variant='solidPink'
				colorPalette='gray'
				disabled={!isValid || isPending}
				loading={isPending}
				w='full'
				mt={4}
			>
				Deletar Poema
			</Button>
		</Flex>
	);
}
