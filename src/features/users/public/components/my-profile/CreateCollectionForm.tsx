import { FormField } from '@BaseComponents';
import { Button, Flex } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
	type CreateCollectionFormValues,
	createCollectionSchema,
} from './schemas/createCollectionSchema';

type CreateCollectionFormProps = {
	userId: number;
	isCreatingCollection: boolean;
	onCreateCollection: (input: {
		userId: number;
		name: string;
		description?: string;
	}) => Promise<void>;
};

export function CreateCollectionForm({
	userId,
	isCreatingCollection,
	onCreateCollection,
}: CreateCollectionFormProps) {
	const form = useForm<CreateCollectionFormValues>({
		defaultValues: {
			name: '',
			description: '',
		},
		mode: 'onChange',
		resolver: zodResolver(createCollectionSchema),
	});
	const collectionName = form.watch('name');

	return (
		<Flex
			as='form'
			direction='column'
			gap={3}
			mb={5}
			w='full'
			onSubmit={form.handleSubmit(async (values) => {
				await onCreateCollection({
					userId,
					name: values.name.trim(),
					description: values.description.trim(),
				});

				form.reset({
					name: '',
					description: '',
				});
			})}
		>
			<FormField
				control={form.control}
				name='name'
				label='Collection name'
				required
				minLength={3}
				maxLength={60}
				showCharacterCount
			/>
			<FormField
				control={form.control}
				name='description'
				label='Collection description'
				as='textarea'
				rows={3}
				maxLength={200}
				showCharacterCount
			/>
			<Button
				type='submit'
				size={{ base: 'xs', md: 'sm' }}
				variant='solidPink'
				loading={isCreatingCollection}
				disabled={!collectionName?.trim() || isCreatingCollection}
				alignSelf='end'
			>
				Create collection
			</Button>
		</Flex>
	);
}
