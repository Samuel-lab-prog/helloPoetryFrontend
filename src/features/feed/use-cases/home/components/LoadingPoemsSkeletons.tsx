import { Avatar, Badge, Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingPoemsSkeletons = (
	<Flex direction='column' gap={0} px={{ base: 0, md: 0 }}>
		{Array.from({ length: 6 }).map((_, index) => (
			<Box
				key={`feed-poem-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				_first={{ borderTop: 'none' }}
				pt={3}
				px={{ base: 3.5, md: 4 }}
				py={{ base: 3, md: 4 }}
			>
				<Flex direction='column' gap={3}>
					<Flex direction='column' gap={2}>
						<Skeleton height='24px' width={{ base: '72%', md: '66%' }} borderRadius='md' />
						<Skeleton height='12px' width='92%' borderRadius='md' />
						<Skeleton height='12px' width='78%' borderRadius='md' />
					</Flex>

					<Flex align='center' gap={2} px={2} py={1.5} w='fit-content' borderRadius='md'>
						<Avatar.Root size={{ base: 'xs', md: 'md' }}>
							<Skeleton height='100%' width='100%' borderRadius='full' />
						</Avatar.Root>
						<Flex direction='column' gap={1}>
							<Skeleton height='12px' width='120px' borderRadius='md' />
							<Skeleton height='10px' width='72px' borderRadius='md' />
						</Flex>
					</Flex>

					<Flex align='center' gap={3} wrap='wrap'>
						<Skeleton height='16px' width='24px' borderRadius='full' />
						<Skeleton height='16px' width='24px' borderRadius='full' />
						<Skeleton height='14px' width='42px' borderRadius='md' />
					</Flex>

					<Flex gap={2} wrap='wrap'>
						<Badge size='sm' variant='subtle' visibility='hidden'>
							placeholder
						</Badge>
						<Skeleton height='22px' width='60px' borderRadius='md' />
						<Skeleton height='22px' width='72px' borderRadius='md' />
						<Skeleton height='22px' width='64px' borderRadius='md' />
					</Flex>
				</Flex>
			</Box>
		))}
	</Flex>
);
