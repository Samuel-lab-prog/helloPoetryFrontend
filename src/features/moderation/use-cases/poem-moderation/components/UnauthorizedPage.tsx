import { ErrorStateCard } from '@BaseComponents';
import { Flex } from '@chakra-ui/react';

type UnauthorizedPageProps = {
	description?: string;
	onBack: () => void;
	title?: string;
};

export function UnauthorizedPage({
	description = 'This page is restricted to moderators and administrators.',
	onBack,
	title = 'Restricted access',
}: UnauthorizedPageProps) {
	return (
		<Flex
			as='main'
			layerStyle='mainPadded'
			direction='column'
			align='center'
			justify='center'
			overflowY='auto'
			scrollbarGutter='stable'
		>
			<ErrorStateCard
				maxW='2xl'
				eyebrow='MODERATION UNAVAILABLE'
				title={title}
				description={description}
				actionLabel='Back'
				onAction={onBack}
			/>
		</Flex>
	);
}
