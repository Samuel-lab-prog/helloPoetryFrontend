import { Surface } from '@BaseComponents';
import { Flex, Heading, HStack, IconButton, Link, Text } from '@chakra-ui/react';
import type { SavedPoemType } from '@root/features/poems/public/hooks/useManageSavedPoems';
import { formatDate } from '@Utils';
import { Bookmark, ExternalLink, X } from 'lucide-react';
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
};

export function SavedPoemsSection({
	savedPoems,
	totalSavedPoemsCount,
	viewAllHref,
	isLoadingSavedPoems,
	isSavingPoem = false,
	saveError = '',
	isSearchingSavedPoems,
	onUnsavePoem,
}: SavedPoemsSectionProps) {
	return (
		<Surface p={5} variant='panel'>
			<Flex
				align={{ base: 'start', md: 'center' }}
				justify='space-between'
				direction={{ base: 'column', md: 'row' }}
				gap={3}
				mb={4}
			>
				<HStack gap={2}>
					<Bookmark size={18} color='var(--chakra-colors-pink-300)' />
					<Heading as='h2' textStyle='h4' color='pink.300'>
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
					>
						<NavLink to={viewAllHref}>View all</NavLink>
					</Link>
				)}
			</Flex>

			<Flex direction='column' gap={3}>
				{isLoadingSavedPoems && <Text textStyle='small'>Loading saved poems...</Text>}
				{!isLoadingSavedPoems && savedPoems.length === 0 && (
					<Text textStyle='small'>
						{isSearchingSavedPoems
							? 'No poems found for your search.'
							: 'You have not saved any poems yet.'}
					</Text>
				)}
				{!isLoadingSavedPoems && Boolean(totalSavedPoemsCount) && (
					<Text textStyle='smaller' color='pink.200'>
						Showing {savedPoems.length} of {totalSavedPoemsCount} saved poems.
					</Text>
				)}

				{savedPoems.map((poem, index) => (
					<Flex
						key={poem.id}
						align={{ base: 'start', md: 'center' }}
						justify='space-between'
						direction={{ base: 'column', md: 'row' }}
						gap={3}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
						animationName='slide-from-bottom, fade-in'
						animationDuration='320ms'
						animationTimingFunction='ease-out'
						animationFillMode='backwards'
						animationDelay={`${30 + index * 30}ms`}
					>
						<Flex direction='column' gap={1}>
							<Text textStyle='small'>{poem.title}</Text>
							<Text textStyle='smaller' color='pink.200'>
								Saved on {formatDate(poem.savedAt)}
							</Text>
						</Flex>
						<Flex gap={2}>
							<IconButton
								aria-label='Open saved poem'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								asChild
							>
								<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
									<ExternalLink />
								</NavLink>
							</IconButton>
							{onUnsavePoem && (
								<IconButton
									aria-label='Remove from saved'
									size={{ base: 'xs', md: 'sm' }}
									variant='solidPink'
									colorPalette='gray'
									loading={isSavingPoem}
									onClick={() => {
										void onUnsavePoem(poem.id);
									}}
								>
									<X />
								</IconButton>
							)}
						</Flex>
					</Flex>
				))}
			</Flex>
			{saveError && (
				<Text mt={3} textStyle='small' color='red.400'>
					{saveError}
				</Text>
			)}
		</Surface>
	);
}
