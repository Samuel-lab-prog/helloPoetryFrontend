import { Surface } from '@BaseComponents';
import { Badge, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';

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
			<Surface variant='gradient' maxW='2xl' w='full'>
				<VStack align='start' gap={3}>
					<Badge colorPalette='pink' variant='subtle'>
						Moderation
					</Badge>
					<Heading as='h1' textStyle='h3'>
						{title}
					</Heading>
					<Text textStyle='small' color='pink.100'>
						{description}
					</Text>
					<Button size='sm' variant='solidPink' onClick={onBack}>
						Back
					</Button>
				</VStack>
			</Surface>
		</Flex>
	);
}
