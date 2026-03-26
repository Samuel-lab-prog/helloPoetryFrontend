import { Flex, Heading, IconButton, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import { Surface, formatDate } from '@root/core/base';
import type { SavedPoemsSectionProps } from './types';

export function SavedPoemsSection({
	savedPoems,
	totalSavedPoemsCount,
	viewAllHref,
	isLoadingSavedPoems,
	isSavingPoem = false,
	saveError = '',
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
				<Heading as='h2' textStyle='h4' color='pink.300'>
					Saved poems
				</Heading>
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
					<Text textStyle='small'>You have not saved any poems yet.</Text>
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
