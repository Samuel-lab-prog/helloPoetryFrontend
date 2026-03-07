import { Flex, Button, Text } from '@chakra-ui/react';
import { useDeletePostForm } from '../hooks/useDeleteForm';
import { usePostsMinimal } from '../hooks/usePostsMinimal';
import { PostCombobox } from '@features/posts';

export function DeletePostForm() {
	const { poems } = usePostsMinimal();

	const {
		handleSubmit,
		onSubmit,
		formState: { isValid },
		control,
		isPending,
		generalError,
	} = useDeletePostForm();

	return (
		<Flex
			as='form'
			w='full'
			direction='column'
			gap={6}
			onSubmit={handleSubmit(onSubmit)}
		>
			{generalError && <Text color='red.500'>{generalError}</Text>}

			<PostCombobox name='id' poems={poems} control={control} />

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
