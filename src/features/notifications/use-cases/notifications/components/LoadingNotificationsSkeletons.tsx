import { Badge, Box, Flex, Skeleton, VStack } from '@chakra-ui/react';

export const LoadingNotificationsSkeletons = (
	<Flex direction='column' gap={1}>
		{Array.from({ length: 5 }).map((_, index) => (
			<Box
				key={`notification-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				_first={{ borderTop: 'none' }}
				py={2}
				px={4}
			>
				<Flex align='start' gap={3}>
					<Skeleton boxSize={{ base: '10', md: '12' }} borderRadius='full' flexShrink={0} />
					<VStack align='start' gap={2} flex='1' minW={0}>
						<Skeleton height='14px' width='84%' maxW='18rem' />
						<Skeleton height='12px' width='62%' maxW='12rem' />
						<Flex align='center' justify='space-between' w='full' gap={2}>
							<Skeleton height='10px' width='28%' maxW='7rem' />
							<Badge size='sm' colorPalette='pink' variant='subtle' opacity={0.45} px={2} py={1}>
								<Skeleton height='10px' width='6.5rem' />
							</Badge>
						</Flex>
					</VStack>
				</Flex>
			</Box>
		))}
	</Flex>
);
