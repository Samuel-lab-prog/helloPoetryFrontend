import { Surface } from '@BaseComponents';
import {
	Badge,
	Box,
	Flex,
	Heading,
	HStack,
	IconButton,
	Link,
	Menu,
	Portal,
	Text,
} from '@chakra-ui/react';
import type { FullPoemType } from '@features/poems/public/types';
import { formatRelativeTime, translateModerationStatus } from '@Utils';
import { EllipsisVertical, Feather } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export type MyPoemsSectionProps = {
	myPoems: FullPoemType[];
	totalPoemsCount?: number;
	viewAllHref?: string;
	searchAnimationKey?: string;
	isLoadingMyPoems: boolean;
	isMyPoemsError: boolean;
	isSearchingMyPoems?: boolean;
	onOpenPoem: (slug: string, id: number) => void;
	onUpdatePoem: (id: number) => void;
	onDeletePoem: (id: number) => void;
	showHeader?: boolean;
	withSurface?: boolean;
};

/**
 * Renders the section for displaying the user's poems.
 * @param myPoems - The list of the user's poems to display. The type is **FullPoem**
 * @param totalPoemsCount - The total count of the user's poems (used for pagination).
 * @param viewAllHref - The URL to view all poems if there are more than the displayed ones.[optional]
 * @param isLoadingMyPoems - Indicates if the poems are currently being loaded.
 * @param isMyPoemsError - Indicates if there was an error loading the poems.
 * @param onOpenPoem - Callback function to open a poem when the "Open" action is selected.
 * @param onUpdatePoem - Callback function to update a poem when the "Edit" action is selected.
 * @param onDeletePoem - Callback function to delete a poem when the "Delete" action is selected.
 * @returns
 */
export function MyPoemsSection({
	myPoems,
	totalPoemsCount,
	viewAllHref,
	searchAnimationKey,
	isLoadingMyPoems,
	isMyPoemsError,
	isSearchingMyPoems,
	onOpenPoem,
	onUpdatePoem,
	onDeletePoem,
	showHeader = true,
	withSurface = true,
}: MyPoemsSectionProps) {
	const content = (
		<>
			{showHeader && (
				<>
					<Flex align='center' justify='space-between' direction='row' gap={3} mb={2} w='full'>
						<HStack gap={2}>
							<Feather size={18} color='var(--chakra-colors-pink-300)' />
							<Heading as='h2' textStyle='h5' color='pink.300' textTransform='none'>
								My poems
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
					{viewAllHref && Boolean(totalPoemsCount) && (
						<Text mb={4} textStyle='smaller' color='pink.200' textAlign='left'>
							Showing {myPoems.length} of {totalPoemsCount} poems
						</Text>
					)}
				</>
			)}

			<Flex
				key={searchAnimationKey ?? 'poems-list'}
				direction='column'
				gap={3}
				animationName='fade-in, slide-from-bottom'
				animationDuration='220ms'
				animationTimingFunction='ease-out'
				animationFillMode='backwards'
			>
				{isLoadingMyPoems && <Text textStyle='small'>Loading your poems...</Text>}
				{!isLoadingMyPoems && !isMyPoemsError && myPoems.length === 0 && (
					<Text textStyle='small'>
						{isSearchingMyPoems
							? 'No poems found for your search.'
							: 'You have not published any poems yet.'}
					</Text>
				)}
				{isMyPoemsError && (
					<Text textStyle='small' color='red.400'>
						Error loading your poems.
					</Text>
				)}

				{myPoems.map((poem, index) => {
					const canEdit =
						poem.moderationStatus === 'rejected' ||
						(poem.status !== 'published' && poem.moderationStatus !== 'removed');
					const canDelete = poem.moderationStatus !== 'removed';
					return (
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
							<Flex direction='column' gap={1} flex='1' w='full'>
								<Flex align='center' gap={2} wrap='wrap'>
									<Text textStyle='small'>{poem.title}</Text>
									{poem.status === 'draft' && (
										<Badge size='sm' colorPalette='purple' variant='subtle'>
											Draft
										</Badge>
									)}
								</Flex>
								<Text textStyle='smaller' color='pink.200'>
									{formatRelativeTime(poem.createdAt)} | {translateStatus(poem.status)} |{' '}
									{translateVisibility(poem.visibility)}
								</Text>
								{poem.status === 'published' && (
									<Text
										textStyle='smaller'
										color={getModerationTextColor(poem.moderationStatus)}
										fontWeight='semibold'
									>
										{translateModerationStatus(poem.moderationStatus)}
									</Text>
								)}
								{poem.moderationStatus === 'rejected' && (
									<Box
										mt={1}
										px={3}
										py={2}
										border='1px solid'
										borderColor='red.500'
										borderRadius='md'
										bg='rgba(255, 60, 100, 0.08)'
									>
										<Text textStyle='smaller' color='red.200' fontWeight='semibold'>
											Rejected
										</Text>
										<Text textStyle='smaller' color='pink.100' mt={1} whiteSpace='pre-wrap'>
											{poem.rejectionReason?.trim() || 'No rejection reason was provided.'}
										</Text>
									</Box>
								)}
								{poem.stats && (
									<Text textStyle='smaller' color='pink.200'>
										{poem.stats.likesCount} likes | {poem.stats.commentsCount} comments
									</Text>
								)}
								{poem.tags?.length > 0 && (
									<HStack gap={1} wrap='wrap'>
										{poem.tags.slice(0, 4).map((tag) => (
											<Badge
												key={tag.id}
												size='sm'
												colorPalette='pink'
												variant='subtle'
												textStyle='smaller'
											>
												#{tag.name}
											</Badge>
										))}
									</HStack>
								)}
							</Flex>

							<Menu.Root positioning={{ placement: 'bottom-end' }}>
								<Menu.Trigger asChild>
									<IconButton
										aria-label='Open actions menu'
										variant='solidPink'
										size={{ base: 'xs', md: 'sm' }}
										alignSelf={{ base: 'end', md: 'auto' }}
									>
										<EllipsisVertical />
									</IconButton>
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content
											bg='rgba(27, 0, 25, 0.98)'
											border='1px solid'
											borderColor='purple.700'
										>
											<Menu.Item
												value={`open-${poem.id}`}
												color='pink.100'
												_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
												onClick={() => onOpenPoem(poem.slug, poem.id)}
											>
												Open
											</Menu.Item>
											{canEdit && (
												<Menu.Item
													value={`update-${poem.id}`}
													color='pink.100'
													_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
													onClick={() => onUpdatePoem(poem.id)}
												>
													Edit
												</Menu.Item>
											)}
											{canDelete && (
												<Menu.Item
													value={`delete-${poem.id}`}
													color='pink.100'
													_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
													onClick={() => onDeletePoem(poem.id)}
												>
													Delete
												</Menu.Item>
											)}
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>
						</Flex>
					);
				})}
			</Flex>
		</>
	);

	if (!withSurface) return content;

	return (
		<Surface p={5} variant='panel'>
			{content}
		</Surface>
	);
}

function translateStatus(status: string) {
	switch (status) {
		case 'draft':
			return 'Draft';
		case 'published':
			return 'Published';
		default:
			return status;
	}
}

function translateVisibility(visibility: string) {
	switch (visibility) {
		case 'public':
			return 'Public';
		case 'friends':
			return 'Friends';
		case 'private':
			return 'Private';
		case 'unlisted':
			return 'Unlisted';
		default:
			return visibility;
	}
}

function getModerationTextColor(status: string) {
	switch (status) {
		case 'approved':
			return 'green.300';
		case 'pending':
			return 'yellow.300';
		case 'rejected':
			return 'red.500';
		case 'removed':
			return 'red.300';
		default:
			return 'gray.300';
	}
}
