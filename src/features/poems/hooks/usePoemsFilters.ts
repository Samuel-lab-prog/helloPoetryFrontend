import { useSearchParams } from 'react-router-dom';
import { useForm, type Control } from 'react-hook-form';
import { useEffect } from 'react';
export type OrderOption = 'newest' | 'oldest';

type UsePoemFiltersReturn = {
	control: Control<{ order: OrderOption }>;
	order: OrderOption;
};

export function usePoemsFilters(): UsePoemFiltersReturn {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialOrder = (searchParams.get('order') as OrderOption) || 'newest';

	const form = useForm<{ order: OrderOption }>({
		defaultValues: {
			order: initialOrder,
		},
		mode: 'onChange',
	});

	const order = form.watch('order');

	useEffect(() => {
		const params = new URLSearchParams();
		params.set('order', order);
		setSearchParams(params, { replace: true });
	}, [order, setSearchParams]);

	return { control: form.control, order };
}
