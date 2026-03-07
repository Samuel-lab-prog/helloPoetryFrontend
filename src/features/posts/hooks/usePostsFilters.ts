import { useSearchParams } from 'react-router-dom';
import { useForm, type Control } from 'react-hook-form';
import { useEffect } from 'react';
export type OrderOption = 'newest' | 'oldest';

type UsePostFiltersReturn = {
	control: Control<{ tag?: string; order: OrderOption }>;
	tag?: string;
	order: OrderOption;
};

export function usePostsFilters(): UsePostFiltersReturn {
	const [searchParams, setSearchParams] = useSearchParams();

	const initialTag = searchParams.get('tag') || undefined;
	const initialOrder = (searchParams.get('order') as OrderOption) || 'newest';

	const form = useForm<{ tag?: string; order: OrderOption }>({
		defaultValues: {
			tag: initialTag,
			order: initialOrder,
		},
		mode: 'onChange',
	});

	const tag = form.watch('tag');
	const order = form.watch('order');

	useEffect(() => {
		const params = new URLSearchParams();
		if (tag) params.set('tag', tag);
		params.set('order', order);
		setSearchParams(params, { replace: true });
	}, [tag, order, setSearchParams]);

	return { control: form.control, tag, order };
}
