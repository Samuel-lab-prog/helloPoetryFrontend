import { Box, type BoxProps, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { stateCardSurfaceStyles } from '../state-card/surfaceStyles';

type EmptyStateCardProps = Omit<BoxProps, 'title'> & {
	role?: 'status' | 'alert';
	ariaLive?: 'polite' | 'assertive';
	eyebrow?: ReactNode;
	eyebrowIcon?: LucideIcon;
	eyebrowIconColor?: string;
	title: ReactNode;
	description: ReactNode;
	action?: ReactNode;
	actionAlign?: 'start' | 'end';
};

export function EmptyStateCard({
	role = 'status',
	ariaLive = 'polite',
	eyebrow,
	eyebrowIcon,
	eyebrowIconColor = 'pink.200',
	title,
	description,
	action,
	actionAlign = 'start',
	children,
	...boxProps
}: EmptyStateCardProps) {
	return (
		<Box
			role={role}
			aria-live={ariaLive}
			w='full'
			{...stateCardSurfaceStyles}
			{...boxProps}
		>
			<VStack align='start' gap={4} position='relative' zIndex={1}>
				{eyebrow ? (
					<HStack
						px={3}
						py={2}
						borderRadius='full'
						bg='rgba(255, 255, 255, 0.06)'
						border='1px solid'
						borderColor='rgba(255, 255, 255, 0.08)'
						gap={2}
					>
						{eyebrowIcon ? <Icon as={eyebrowIcon} boxSize={4.5} color={eyebrowIconColor} /> : null}
						<Text
							textStyle='smaller'
							color='pink.200'
							letterSpacing='0.08em'
							textTransform='uppercase'
						>
							{eyebrow}
						</Text>
					</HStack>
				) : null}

				<VStack align='start' gap={2} w='full'>
					<Heading as='h2' textStyle='h4' color='white' mb={0}>
						{title}
					</Heading>
					<Text textStyle='smaller' color='pink.100'>
						{description}
					</Text>
				</VStack>

				{action ? (
					<Box w='full' display='flex' justifyContent={actionAlign === 'end' ? 'end' : 'start'}>
						{action}
					</Box>
				) : null}

				{children}
			</VStack>
		</Box>
	);
}
