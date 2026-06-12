import { Surface } from '@BaseComponents';
import {
	Avatar,
	Flex,
	Heading,
	HStack,
	IconButton,
	Link,
	LinkBox,
	LinkOverlay,
	Text,
} from '@chakra-ui/react';
import type { SavedPoemType } from '@features/poems/public/types';
import { formatDate } from '@Utils';
import { Bookmark, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

export type SavedPoemsSectionProps = {
	savedPoems: SavedPoemType[];
	totalSavedPoemsCount?: number;
	viewAllHref?: string;
	isLoadingSavedPoems: boolean;
	isSavingPoem?: boolean;
	saveError?: string;
	isSearchingSavedPoems?: boolean;
	onUnsavePoem?: (poemId: number) => Promise<void>;
	updatingSavedPoemId?: number | null;
	showHeader?: boolean;
	withSurface?: boolean;
};

export function SavedPoemsSection({
	savedPoems,
	totalSavedPoemsCount,
	viewAllHref,
	isLoadingSavedPoems,
	saveError = '',
	isSearchingSavedPoems,
	onUnsavePoem,
	updatingSavedPoemId,
	showHeader = true,
	withSurface = true,
}: SavedPoemsSectionProps) {
	const [removingId, setRemovingId] = useState<number | null>(null);

	useEffect(() => {
		if (removingId === null) return;
		if (!savedPoems.some((poem) => poem.id === removingId)) {
			setRemovingId(null);
		}
	}, [removingId, savedPoems]);

	const content = (
		<>
			{showHeader && (
				<>
					<Flex align='center' justify='space-between' direction='row' gap={3} mb={2} w='full'>
						<HStack gap={2}>
							<Bookmark size={18} color='var(--chakra-colors-pink-300)' />
							<Heading as='h2' textStyle='h5' color='pink.300' textTransform='none'>
								Saved poems
							</Heading>
						</HStack>
						{viewAllHref && (
							<Link
								asChild
								textStyle='small'
								color='pink.200'
								textDecoration='underline'
								textUnderlineOffset='3px'
								flexShrink={0}
							>
								<NavLink to={viewAllHref}>View all</NavLink>
							</Link>
						)}
					</Flex>
					{viewAllHref && Boolean(totalSavedPoemsCount) && (
						<Text mb={4} textStyle='smaller' color='pink.200' textAlign='left'>
							Showing {savedPoems.length} of {totalSavedPoemsCount} saved poems
						</Text>
					)}
				</>
			)}

			<Flex direction='column' gap={3}>
				{isLoadingSavedPoems && <Text textStyle='small'>Loading saved poems...</Text>}
				{!isLoadingSavedPoems && savedPoems.length === 0 && (
					<Text textStyle='small'>
						{isSearchingSavedPoems
							? 'No poems found for your search.'
							: 'You have not saved any poems yet.'}
					</Text>
				)}
				{!showHeader && !isLoadingSavedPoems && Boolean(totalSavedPoemsCount) && (
					<Text textStyle='smaller' color='pink.200'>
						Showing {savedPoems.length} of {totalSavedPoemsCount} saved poems.
					</Text>
				)}

				{savedPoems.map((poem, index) => {
					const isRemoving = removingId === poem.id || updatingSavedPoemId === poem.id;

					return (
						<Flex
							key={poem.id}
							position='relative'
							align={{ base: 'start', md: 'center' }}
							justify='space-between'
							direction={{ base: 'column', md: 'row' }}
							gap={3}
							p={3}
							pr={{ base: 14, md: 3 }}
							border='1px solid'
							borderColor='purple.700'
							borderRadius='md'
							_hover={{
								bg: 'rgba(255, 255, 255, 0.04)',
								borderColor: 'purple.500',
							}}
							animationName='slide-from-bottom, fade-in'
							animationDuration='320ms'
							animationTimingFunction='ease-out'
							animationFillMode='backwards'
							animationDelay={`${30 + index * 30}ms`}
							opacity={isRemoving ? 0.4 : 1}
							transform={isRemoving ? 'scale(0.98)' : undefined}
							transition='opacity 0.18s ease, transform 0.18s ease'
						>
							<LinkBox w='full' flex='1'>
								<LinkOverlay asChild>
									<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
										<Flex direction='column' gap={1}>
											<Text textStyle='small'>{poem.title}</Text>
											<Text textStyle='smaller' color='pink.200'>
												Saved on {formatSavedDate(poem.savedAt)}
											</Text>
										</Flex>
									</NavLink>
								</LinkOverlay>
								{poem.author?.name && poem.author?.nickname && (
									<Link asChild display='inline-flex' w='fit-content' alignSelf='start' mt={2}>
										<NavLink to={`/authors/${poem.author.id}`}>
											<Flex
												align='center'
												gap={2}
												pl={2}
												pr={2}
												py={1.5}
												w='fit-content'
												display='inline-flex'
												borderRadius='md'
												transition='background-color 0.2s ease'
												_hover={{ bg: 'rgba(255, 255, 255, 0.04)' }}
											>
												<Avatar.Root size='xs'>
													<Avatar.Image src={poem.author.avatarUrl ?? undefined} />
													<Avatar.Fallback name={poem.author.nickname} />
												</Avatar.Root>
												<Flex direction='column' minW={0} gap={0}>
													<Text textStyle='smaller' color='pink.100' lineHeight='short' truncate>
														{poem.author.name}
													</Text>
													<Text textStyle='smaller' color='pink.200' opacity={0.9}>
														@{poem.author.nickname}
													</Text>
												</Flex>
											</Flex>
										</NavLink>
									</Link>
								)}
							</LinkBox>
							{onUnsavePoem && (
								<IconButton
									aria-label='Remove saved poem'
									variant='solidPink'
									colorPalette='pink'
									size='sm'
									position='absolute'
									top={3}
									right={3}
									minW='36px'
									flexShrink={0}
									loading={isRemoving}
									disabled={isRemoving}
									onClick={() => {
										if (!onUnsavePoem) return;
										if (isRemoving) return;
										setRemovingId(poem.id);
										window.setTimeout(() => {
											void onUnsavePoem(poem.id);
										}, 180);
									}}
								>
									<X size={16} />
								</IconButton>
							)}
						</Flex>
					);
				})}
			</Flex>
			{saveError && (
				<Text mt={3} textStyle='small' color='red.400'>
					{saveError}
				</Text>
			)}
		</>
	);

	if (!withSurface) return content;

	return (
		<Surface p={5} variant='panel'>
			{content}
		</Surface>
	);
}

function formatSavedDate(date: string | Date) {
	const parsed = typeof date === 'string' ? new Date(date) : date;
	if (Number.isNaN(parsed.getTime())) {
		return formatDate(date);
	}
	return parsed.toLocaleDateString('en-US', { dateStyle: 'medium' });
}
