import { Box, Button, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { SearchX, Users, X } from 'lucide-react';

type EmptyPoetsStateProps = {
	hasSearch: boolean;
	onClearSearch?: () => void;
};

export function EmptyPoetsState({ hasSearch, onClearSearch }: EmptyPoetsStateProps) {
	return (
		<Box
			w='full'
			role='status'
			aria-live='polite'
			position='relative'
			overflow='hidden'
			borderRadius='2xl'
			border='1px solid'
			borderColor='purple.700'
			bgGradient='linear(to-br, rgba(42, 21, 57, 0.92), rgba(30, 20, 46, 0.98) 55%, rgba(25, 31, 58, 0.96))'
			p={{ base: 5, md: 6 }}
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
					<Icon as={hasSearch ? SearchX : Users} boxSize={4.5} color='pink.200' />
					<Text
						textStyle='smaller'
						color='pink.200'
						letterSpacing='0.08em'
						textTransform='uppercase'
					>
						{hasSearch ? 'Search empty' : 'No poets yet'}
					</Text>
				</HStack>

				<VStack align='start' gap={2} w='full'>
					<Heading as='h2' textStyle='h4' color='white' mb={0}>
						{hasSearch ? 'No poets match this nickname' : 'This search is waiting for poets'}
					</Heading>
					<Text textStyle='smaller' color='pink.100'>
						{hasSearch
							? 'Try a different nickname or clear the search to browse all poets again.'
							: 'When poets appear, they will show up here in a clearer empty state.'}
					</Text>
				</VStack>

				{hasSearch && onClearSearch ? (
					<Button size='sm' variant='solidPink' onClick={onClearSearch} alignSelf='start'>
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
