import { poemKeys } from '@Api/poems/keys';
import { SearchInput } from '@BaseComponents';
import { Box, Button, Field, Flex, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { getPoemsQueryPort } from '@core/ports/poems';
import { useIsAuthenticated } from '@features/auth/public/hooks/useIsAuthenticated';
import type { PaginatedPoemsType } from '@features/poems/public/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { HomeFeed } from './components/HomeFeed';
import { useHomeFeed } from './hooks/useHomeFeed';
import { POEMS_FEED_LIMIT, POEMS_FEED_LIMIT_UNAUTHENTICATED } from './utils/constants';

const DEFAULT_ORDER = 'createdAt:desc';
const SEARCH_PAGE_SIZE = 20;

function normalizeTags(tags: string[]) {
	const seen = new Set<string>();
	return tags
		.map((tag) => tag.trim())
		.filter((tag) => {
			const key = tag.toLocaleLowerCase();
			if (!tag || seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.slice(0, 5);
}

function parseOrder(value: string | null) {
	if (value === 'createdAt:asc' || value === 'title:asc' || value === 'title:desc') return value;
	return DEFAULT_ORDER;
}

function syncTitleFromUrl(
	syncState: { current: { dirty: boolean } },
	title: string,
	setTitle: (title: string) => void,
) {
	if (!syncState.current.dirty) setTitle(title);
}

type UpdateSearchParams = (update: (params: URLSearchParams) => void, replace?: boolean) => void;

function useSearchTitle(queryTitle: string, updateSearchParams: UpdateSearchParams) {
	const [searchTitle, setSearchTitle] = useState(queryTitle);
	const syncState = useRef({ dirty: false, ignoreNextEmptyCommit: false });
	const setTitle = useCallback((value: string) => {
		syncState.current.dirty = true;
		syncState.current.ignoreNextEmptyCommit = false;
		setSearchTitle(value);
	}, []);
	const commitTitle = useCallback(
		(value: string) => {
			const shouldIgnoreEmptyCommit = !value && syncState.current.ignoreNextEmptyCommit;
			syncState.current.ignoreNextEmptyCommit = false;
			if (shouldIgnoreEmptyCommit) return;
			syncState.current.dirty = false;
			updateSearchParams((params) => {
				if (value) params.set('q', value);
				else params.delete('q');
			}, true);
		},
		[updateSearchParams],
	);
	const clearTitle = useCallback(() => {
		syncState.current.dirty = false;
		syncState.current.ignoreNextEmptyCommit = true;
		setSearchTitle('');
	}, []);

	useEffect(() => syncTitleFromUrl(syncState, queryTitle, setSearchTitle), [queryTitle]);

	return { searchTitle, setTitle, commitTitle, clearTitle };
}

export function HomePage() {
	const isAuthenticated = useIsAuthenticated();
	const [searchParams, setSearchParams] = useSearchParams();
	const queryTitle = searchParams.get('q') ?? '';
	const selectedTags = useMemo(() => normalizeTags(searchParams.getAll('tag')), [searchParams]);
	const order = parseOrder(searchParams.get('order'));
	const [tagInput, setTagInput] = useState('');
	const updateSearchParams = useCallback(
		(update: (params: URLSearchParams) => void, replace = false) => {
			setSearchParams(
				(current) => {
					const next = new URLSearchParams(current);
					update(next);
					return next;
				},
				{ replace },
			);
		},
		[setSearchParams],
	);
	const { searchTitle, setTitle, commitTitle, clearTitle } = useSearchTitle(
		queryTitle,
		updateSearchParams,
	);
	const setTags = useCallback(
		(tags: string[]) => {
			updateSearchParams((params) => {
				params.delete('tag');
				for (const tag of normalizeTags(tags)) params.append('tag', tag);
			});
		},
		[updateSearchParams],
	);
	const setOrder = useCallback(
		(value: string) => {
			updateSearchParams((params) => {
				if (value === DEFAULT_ORDER) params.delete('order');
				else params.set('order', value);
			});
		},
		[updateSearchParams],
	);
	const clearFilters = useCallback(() => {
		clearTitle();
		updateSearchParams((params) => {
			params.delete('q');
			params.delete('tag');
			params.delete('order');
		}, true);
		setTagInput('');
	}, [clearTitle, updateSearchParams]);

	const {
		poems: feedPoems,
		isError: isFeedError,
		isLoading: isFeedLoading,
		error: feedError,
	} = useHomeFeed({
		isAuthenticated,
		limit: isAuthenticated ? POEMS_FEED_LIMIT : POEMS_FEED_LIMIT_UNAUTHENTICATED,
	});
	const poemsQueryPort = getPoemsQueryPort();
	const [orderBy, orderDirection] = order.split(':') as ['createdAt' | 'title', 'asc' | 'desc'];
	const isSearching = Boolean(queryTitle.trim() || selectedTags.length || order !== DEFAULT_ORDER);
	const searchFilters = useMemo(
		() => ({
			limit: SEARCH_PAGE_SIZE,
			searchTitle: queryTitle.trim() || undefined,
			tags: selectedTags.length ? selectedTags : undefined,
			orderBy,
			orderDirection,
		}),
		[orderBy, orderDirection, queryTitle, selectedTags],
	);
	const searchQuery = useInfiniteQuery<
		PaginatedPoemsType,
		Error,
		{ pages: PaginatedPoemsType[]; pageParams: (number | undefined)[] },
		readonly unknown[],
		number | undefined
	>({
		queryKey: poemKeys.search(searchFilters),
		initialPageParam: undefined,
		queryFn: ({ pageParam }) =>
			poemsQueryPort
				.getSearchQueryOptions({
					...searchFilters,
					cursor: pageParam,
				})
				.queryFn(),
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
		enabled: isSearching,
	});

	const displayedPoems = isSearching
		? (searchQuery.data?.pages.flatMap((page) => page.poems) ?? [])
		: feedPoems;
	const isLoading = isSearching ? searchQuery.isLoading : isFeedLoading;
	const hasError = isSearching ? searchQuery.isError : isFeedError;
	const error = isSearching ? searchQuery.error : feedError;
	const canAddTag =
		tagInput.trim().length >= 2 && tagInput.trim().length <= 24 && selectedTags.length < 5;
	const addTag = useCallback(() => {
		const nextTag = tagInput.trim();
		if (nextTag.length < 2 || nextTag.length > 24 || selectedTags.length >= 5) return;
		setTags([...selectedTags, nextTag]);
		setTagInput('');
	}, [selectedTags, setTags, tagInput]);

	return (
		<Flex direction='column' minH='100%'>
			<Flex
				as='main'
				layerStyle='mainPadded'
				direction='column'
				align='center'
				px={0}
				pb={{ base: 20, md: 12 }}
				flex='1'
				w='full'
				maxW='2xl'
				mx='auto'
			>
				<VStack as='section' w='full' align='stretch' gap={4}>
					<Box px={4} pt={4}>
						<SearchInput
							label='Search poems'
							value={searchTitle}
							onValueChange={setTitle}
							onDebouncedChange={commitTitle}
							debounceMs={150}
							maxLength={120}
							placeholder='Search by title'
						/>
						<Flex
							mt={3}
							gap={2}
							align={{ base: 'stretch', md: 'start' }}
							direction={{ base: 'column', md: 'row' }}
						>
							<Field.Root flex='1' minW={0}>
								<Field.Label textStyle='small' htmlFor='poem-tag-filter'>
									Tags (up to 5)
								</Field.Label>
								<HStack mt={1} gap={2}>
									<Input
										id='poem-tag-filter'
										textStyle='body'
										value={tagInput}
										onChange={(event) => setTagInput(event.target.value)}
										onKeyDown={(event) => {
											if (event.key === 'Enter') {
												event.preventDefault();
												addTag();
											}
										}}
										placeholder='Enter tag'
										disabled={selectedTags.length >= 5}
										maxLength={24}
										minW={0}
										flex='1'
									/>
									<Button
										size='sm'
										variant='subtle'
										colorPalette='pink'
										flexShrink={0}
										onClick={addTag}
										disabled={!canAddTag}
									>
										Add tag
									</Button>
								</HStack>
								<Text textStyle='smaller' color='pink.200' mt={1}>
									When several tags are selected, a poem may match any of them.
								</Text>
							</Field.Root>
							<Field.Root w={{ base: 'full', md: '180px' }} flexShrink={0}>
								<Field.Label textStyle='small' htmlFor='poem-sort'>
									Sort results
								</Field.Label>
								<select
									id='poem-sort'
									value={order}
									onChange={(event) => setOrder(event.currentTarget.value)}
									style={{
										width: '100%',
										minHeight: '40px',
										marginTop: '4px',
										padding: '8px 12px',
										fontSize: '16px',
										lineHeight: '1.25',
										color: 'inherit',
										background: 'rgba(255,255,255,0.03)',
										border: '1px solid var(--chakra-colors-border)',
										borderRadius: 'var(--chakra-radii-md)',
									}}
								>
									<option value='createdAt:desc'>Newest</option>
									<option value='createdAt:asc'>Oldest</option>
									<option value='title:asc'>Title A–Z</option>
									<option value='title:desc'>Title Z–A</option>
								</select>
							</Field.Root>
						</Flex>
						{(queryTitle || selectedTags.length > 0 || order !== DEFAULT_ORDER) && (
							<Flex mt={3} gap={2} wrap='wrap' role='group' aria-label='Active search filters'>
								{queryTitle && (
									<Button
										size='xs'
										variant='subtle'
										colorPalette='pink'
										onClick={() => {
											setTitle('');
											commitTitle('');
										}}
										aria-label='Remove title filter'
									>
										Title: {queryTitle} ×
									</Button>
								)}
								{selectedTags.map((tag) => (
									<Button
										key={tag}
										size='xs'
										variant='subtle'
										colorPalette='pink'
										onClick={() => setTags(selectedTags.filter((item) => item !== tag))}
										aria-label={`Remove tag ${tag}`}
									>
										#{tag} ×
									</Button>
								))}
								{order !== DEFAULT_ORDER && (
									<Button
										size='xs'
										variant='subtle'
										colorPalette='pink'
										onClick={() => setOrder(DEFAULT_ORDER)}
										aria-label='Reset sort order'
									>
										Sort:{' '}
										{orderBy === 'title'
											? orderDirection === 'asc'
												? 'Title A–Z'
												: 'Title Z–A'
											: 'Oldest'}{' '}
										×
									</Button>
								)}
							</Flex>
						)}
						{isSearching && (
							<Button mt={2} size='xs' variant='ghostPink' w='fit-content' onClick={clearFilters}>
								Clear all filters
							</Button>
						)}
					</Box>

					<HomeFeed
						poems={displayedPoems}
						isLoading={isLoading}
						isError={hasError}
						isSearching={isSearching}
						error={error}
						onClearSearch={clearFilters}
						onTagClick={(tag) => setTags([...selectedTags, tag])}
					/>
					{isSearching && searchQuery.hasNextPage && (
						<Flex justify='center' px={4}>
							<Button
								variant='outline'
								onClick={() => searchQuery.fetchNextPage()}
								loading={searchQuery.isFetchingNextPage}
							>
								Load more poems
							</Button>
						</Flex>
					)}
				</VStack>
			</Flex>
		</Flex>
	);
}
