import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Box, Button, Flex, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { PoemCard } from '@features/poems/public/components/PoemCard';
import type { PoemPreview } from '@features/poems/public/types';
import { SearchX, Sparkles, X } from 'lucide-react';

import { LoadingPoemsSkeletons } from './LoadingPoemsSkeletons';

type HomeFeedProps = {
	poems: PoemPreview[];
	isLoading: boolean;
	isError: boolean;
	isSearching: boolean;
	onClearSearch?: () => void;
};

function EmptyFeedState({
	isSearching,
	onClearSearch,
}: Pick<HomeFeedProps, 'isSearching' | 'onClearSearch'>) {
	return (
		<Box
			role='status'
			aria-live='polite'
			position='relative'
			overflow='hidden'
			borderRadius='2xl'
			border='1px solid'
			borderColor='purple.700'
			bgGradient='linear(to-br, rgba(42, 21, 57, 0.92), rgba(30, 20, 46, 0.98) 55%, rgba(25, 31, 58, 0.96))'
			p={{ base: 5, md: 6 }}
			mt={4}
			mx={3}
			shadow='0 12px 30px rgba(0,0,0,0.28)'
			_before={{
				content: '""',
				position: 'absolute',
				inset: '-40px auto auto -30px',
				w: '180px',
				h: '180px',
				borderRadius: 'full',
				bg: 'pink.500',
				filter: 'blur(70px)',
				opacity: 0.14,
			}}
			_after={{
				content: '""',
				position: 'absolute',
				inset: 'auto -50px -60px auto',
				w: '200px',
				h: '200px',
				borderRadius: 'full',
				bg: 'purple.500',
				filter: 'blur(75px)',
				opacity: 0.18,
			}}
		>
			<VStack align='start' gap={4} position='relative' zIndex={1}>
				<HStack
					px={3}
					py={2}
					borderRadius='full'
					bg='rgba(255, 255, 255, 0.06)'
					border='1px solid'
					borderColor='rgba(255, 255, 255, 0.08)'
					gap={2}
				>
					<Icon as={isSearching ? SearchX : Sparkles} boxSize={4.5} color='pink.200' />
					<Text
						textStyle='smaller'
						color='pink.200'
						letterSpacing='0.08em'
						textTransform='uppercase'
					>
						{isSearching ? 'Search empty' : 'Nothing here yet'}
					</Text>
				</HStack>

				<VStack align='start' gap={2} w='full'>
					<Heading as='h2' textStyle='h4' color='white' mb={0}>
						{isSearching ? 'No poems match this search' : 'This feed is still quiet'}
					</Heading>
					<Text textStyle='smaller' color='pink.100'>
						{isSearching
							? 'Try another title or clear the search to see the full feed again.'
							: 'When new poems are published, they will appear here with a cleaner, more visual empty state.'}
					</Text>
				</VStack>

				{isSearching && onClearSearch ? (
					<Button size='sm' variant='solidPink' onClick={onClearSearch} alignSelf='end'>
						<HStack gap={2}>
							<Icon as={X} boxSize={3.5} />
							<Text as='span'>Clear search</Text>
						</HStack>
					</Button>
				) : null}
			</VStack>
		</Box>
	);
}

export function HomeFeed({ poems, isLoading, isError, isSearching, onClearSearch }: HomeFeedProps) {
	const showSkeletons = isLoading && poems.length === 0;

	return (
		<Box px={{ base: 0, md: 0 }} pt={{ base: 0, md: 0 }}>
			<AsyncState
				isLoading={showSkeletons}
				isError={isError}
				isEmpty={poems.length === 0}
				loadingElement={LoadingPoemsSkeletons}
				errorElement={
					<ErrorStateCard
						eyebrow='FEED UNAVAILABLE'
						title='We could not load your feed right now.'
						description='Your poems are safe. Please try again in a moment, or refresh the page to reconnect.'
						actionLabel='Refresh feed'
						onAction={() => window.location.reload()}
					/>
				}
				emptyElement={<EmptyFeedState isSearching={isSearching} onClearSearch={onClearSearch} />}
			>
				<Flex direction='column' gap={0}>
					{poems.map((poem, index) => (
						<Box
							key={poem.id}
							animationName='slide-from-bottom, fade-in'
							animationDuration='320ms'
							animationTimingFunction='ease-out'
							animationFillMode='backwards'
							animationDelay={`${60 + index * 70}ms`}
							borderTop='1px solid'
							borderColor='purple.700'
							_first={{ borderTop: 'none' }}
							pt={2}
						>
							<PoemCard poem={poem} variant='flat' />
						</Box>
					))}
				</Flex>
			</AsyncState>
		</Box>
	);
}
