import { Surface } from '@BaseComponents';
import { Box, Flex, HStack, Skeleton, VStack } from '@chakra-ui/react';

export const LoadingMyProfileSkeleton = (
	<Flex direction='column' gap={6} w='full'>
		<Flex align='center' justify='space-between' gap={3}>
			<Skeleton height='24px' width='160px' />
			<Skeleton height='32px' width='40px' borderRadius='md' />
		</Flex>

		<Surface
			p={{ base: 5, md: 6 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.18) 0%, rgba(27,0,25,0.34) 100%)'
		>
			<Flex justify='space-between' align='start' direction={{ base: 'column', md: 'row' }} gap={4}>
				<HStack align='start' gap={4} w='full' flex='1'>
					<Skeleton boxSize={{ base: '5.5rem', md: '7.5rem' }} borderRadius='full' />
					<VStack align='start' gap={2} w='full'>
						<Skeleton height='22px' width='220px' />
						<Skeleton height='14px' width='140px' />
						<Skeleton height='12px' width='85%' />
						<Skeleton height='12px' width='70%' />
					</VStack>
				</HStack>
				<Flex direction='column' gap={2} w={{ base: 'full', md: 'auto' }}>
					<Skeleton height='32px' width={{ base: 'full', md: '120px' }} borderRadius='md' />
					<Skeleton height='32px' width={{ base: 'full', md: '120px' }} borderRadius='md' />
				</Flex>
			</Flex>
		</Surface>

		<Flex gap={3} wrap='wrap'>
			{Array.from({ length: 4 }).map((_, index) => (
				<Box
					key={`profile-stat-skeleton-${index}`}
					flex='1'
					minW={{ base: '140px', md: '160px' }}
					p={4}
					border='1px solid'
					borderColor='purple.700'
					borderRadius='md'
				>
					<Skeleton height='12px' width='70%' mb={2} />
					<Skeleton height='18px' width='40%' />
				</Box>
			))}
		</Flex>

		<Surface p={5} variant='panel'>
			<Flex align='center' justify='space-between' mb={4}>
				<Skeleton height='16px' width='160px' />
				<Skeleton height='12px' width='60px' />
			</Flex>
			<Flex direction='column' gap={3}>
				{Array.from({ length: 2 }).map((_, index) => (
					<Flex
						key={`requests-skeleton-${index}`}
						align='center'
						justify='space-between'
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
						gap={3}
					>
						<HStack gap={3}>
							<Skeleton boxSize='40px' borderRadius='full' />
							<VStack align='start' gap={2}>
								<Skeleton height='12px' width='160px' />
								<Skeleton height='10px' width='120px' />
							</VStack>
						</HStack>
						<Skeleton height='28px' width='72px' borderRadius='md' />
					</Flex>
				))}
			</Flex>
		</Surface>

		<Surface p={5} variant='panel'>
			<Flex align='center' justify='space-between' mb={4}>
				<Skeleton height='16px' width='120px' />
				<Skeleton height='12px' width='60px' />
			</Flex>
			<Flex direction='column' gap={3}>
				{Array.from({ length: 2 }).map((_, index) => (
					<Box
						key={`my-poems-skeleton-${index}`}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
					>
						<Skeleton height='14px' width='220px' mb={2} />
						<Skeleton height='12px' width='160px' mb={2} />
						<Skeleton height='10px' width='120px' />
					</Box>
				))}
			</Flex>
		</Surface>

		<Surface p={5} variant='panel'>
			<Flex align='center' justify='space-between' mb={4}>
				<Skeleton height='16px' width='140px' />
				<Skeleton height='12px' width='60px' />
			</Flex>
			<Flex direction='column' gap={3}>
				{Array.from({ length: 2 }).map((_, index) => (
					<Box
						key={`collections-skeleton-${index}`}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
					>
						<Skeleton height='14px' width='200px' mb={2} />
						<Skeleton height='12px' width='160px' />
					</Box>
				))}
			</Flex>
		</Surface>

		<Surface p={5} variant='panel'>
			<Flex align='center' justify='space-between' mb={4}>
				<Skeleton height='16px' width='120px' />
				<Skeleton height='12px' width='60px' />
			</Flex>
			<Flex direction='column' gap={3}>
				{Array.from({ length: 2 }).map((_, index) => (
					<Box
						key={`saved-poems-skeleton-${index}`}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
					>
						<Skeleton height='14px' width='220px' mb={2} />
						<Skeleton height='12px' width='160px' />
					</Box>
				))}
			</Flex>
		</Surface>
	</Flex>
);
