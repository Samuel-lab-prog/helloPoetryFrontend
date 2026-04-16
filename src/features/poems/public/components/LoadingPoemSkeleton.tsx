import { Box, Flex, Skeleton } from '@chakra-ui/react';

type LoadingPoemSkeletonProps = {
	variant?: 'default' | 'immersive';
};

function PoemBodySkeleton() {
	return (
		<Flex direction='column' gap={3}>
			<Skeleton height='34px' width='100%' borderRadius='md' />
			<Skeleton height='34px' width='132px' borderRadius='md' />
			{Array.from({ length: 10 }).map((_, index) => (
				<Skeleton
					key={`poem-content-skeleton-${index}`}
					height='12px'
					width={index % 4 === 3 ? '72%' : '100%'}
				/>
			))}
		</Flex>
	);
}

export function LoadingPoemSkeleton({ variant = 'default' }: LoadingPoemSkeletonProps) {
	if (variant === 'immersive') {
		return (
			<Box w='full'>
				<Flex direction='column' align='center' mb={8} gap={3}>
					<Skeleton height='38px' width='60%' />
					<Skeleton height='12px' width='34%' />
				</Flex>
				<Box
					bg='rgba(255,255,255,0.04)'
					border='1px solid'
					borderColor='purple.700'
					borderRadius='2xl'
					p={{ base: 5, md: 8 }}
					boxShadow='0 30px 80px rgba(0,0,0,0.45)'
					w='full'
				>
					<PoemBodySkeleton />
				</Box>
			</Box>
		);
	}

	return (
		<Flex direction='column' gap={6} w='full'>
			<Box
				p={{ base: 4, md: 6 }}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='2xl'
				bg='linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
			>
				<Flex direction='column' gap={4}>
					<Skeleton height='38px' width='78%' />
					<Skeleton height='14px' width='92%' />
					<Flex gap={2} wrap='wrap'>
						<Skeleton height='22px' width='62px' borderRadius='full' />
						<Skeleton height='22px' width='70px' borderRadius='full' />
						<Skeleton height='22px' width='56px' borderRadius='full' />
					</Flex>
					<Flex direction='column' gap={2}>
						<Skeleton height='10px' width='40%' />
						<Skeleton height='10px' width='34%' />
					</Flex>
					<Flex mt={1} pt={5} borderTop='1px solid' borderColor='purple.700' align='center' gap={3}>
						<Skeleton boxSize='42px' borderRadius='full' />
						<Flex direction='column' gap={2} flex='1'>
							<Skeleton height='10px' width='20%' />
							<Skeleton height='14px' width='38%' />
							<Skeleton height='10px' width='28%' />
							<Skeleton height='10px' width='42%' />
						</Flex>
					</Flex>
				</Flex>
			</Box>

			<Box
				p={{ base: 4, md: 6 }}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='xl'
				bg='rgba(255, 255, 255, 0.03)'
			>
				<PoemBodySkeleton />
				<Flex justify='flex-end' mt={6} gap={2}>
					<Skeleton height='30px' width='86px' borderRadius='md' />
					<Skeleton height='30px' width='86px' borderRadius='md' />
				</Flex>
			</Box>
		</Flex>
	);
}
