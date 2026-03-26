import { Flex, IconButton } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormField } from '@root/core/base';

type CreateCollectionFormValues = {
	name: string;
	description: string;
};

type CreateCollectionFormProps = {
	userId: number;
	isUpdatingCollections: boolean;
	onCreateCollection: (input: {
		userId: number;
		name: string;
		description?: string;
	}) => Promise<void>;
};

export function CreateCollectionForm({
	userId,
	isUpdatingCollections,
	onCreateCollection,
}: CreateCollectionFormProps) {
	const form = useForm<CreateCollectionFormValues>({
		defaultValues: {
			name: '',
			description: '',
		},
		mode: 'onChange',
	});
	const collectionName = form.watch('name');

	return (
		<Flex
			as='form'
			direction='column'
			gap={3}
			mb={5}
			onSubmit={form.handleSubmit(async (values) => {
				const name = values.name.trim();
				if (!name) return;

				await onCreateCollection({
					userId,
					name,
					description: values.description.trim() || undefined,
				});

				form.reset({
					name: '',
					description: '',
				});
			})}
		>
			<FormField control={form.control} name='name' label='Collection name' required />
			<FormField
				control={form.control}
				name='description'
				label='Collection description'
				as='textarea'
				rows={3}
			/>
			<IconButton
				type='submit'
				aria-label='Create collection'
				size={{ base: 'xs', md: 'sm' }}
				variant='solidPink'
				loading={isUpdatingCollections}
				disabled={!collectionName?.trim() || isUpdatingCollections}
				alignSelf='start'
			>
				<Plus />
			</IconButton>
		</Flex>
	);
}
