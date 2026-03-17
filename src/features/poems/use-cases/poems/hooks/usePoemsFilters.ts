import { useSearchParams } from 'react-router-dom';
import { useForm, type Control } from 'react-hook-form';
import { useEffect } from 'react';

export type OrderOption = 'newest' | 'oldest';

type PoemsFiltersForm = {
	order: OrderOption;
	tags: string[];
	searchTitle: string;
};

export type UsePoemFiltersReturn = {
	control: Control<PoemsFiltersForm>;
	order: OrderOption;
	tags: string[];
	searchTitle: string;
};

export function usePoemsFilters(): UsePoemFiltersReturn {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialOrder = (searchParams.get('order') as OrderOption) || 'newest';
	const initialTags = searchParams
		.getAll('tags')
		.map((tag) => tag.trim())
		.filter(Boolean);
	const initialSearchTitle = searchParams.get('searchTitle')?.trim() ?? '';

	const form = useForm<PoemsFiltersForm>({
		defaultValues: {
			order: initialOrder,
			tags: initialTags,
			searchTitle: initialSearchTitle,
		},
		mode: 'onChange',
	});

	const order = form.watch('order');
	const tags = form.watch('tags');
	const searchTitle = form.watch('searchTitle');

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			const params = new URLSearchParams();
			params.set('order', order);
			tags
				.map((tag) => tag.trim())
				.filter(Boolean)
				.forEach((tag) => params.append('tags', tag));

			const normalizedSearchTitle = searchTitle.trim();
			if (normalizedSearchTitle) params.set('searchTitle', normalizedSearchTitle);

			const nextParams = params.toString();
			const currentParams = searchParams.toString();
			if (nextParams !== currentParams) {
				setSearchParams(params, { replace: true });
			}
		}, 250);

		return () => window.clearTimeout(timeoutId);
	}, [order, searchParams, searchTitle, setSearchParams, tags]);

	return { control: form.control, order, tags, searchTitle };
}
