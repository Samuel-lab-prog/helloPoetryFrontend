import { Heading, Text, VStack } from '@chakra-ui/react';
import { Surface } from '@root/core/base';

type HomeHeaderProps = {
	title: string;
	subtitle: string;
};

export function HomeHeader({ title, subtitle }: HomeHeaderProps) {
	return (
		<Surface>
			<VStack align='start' gap={2}>
				<Heading as='h1' textStyle='h2'>
					{title}
				</Heading>
				<Text color='pink.200'>{subtitle}</Text>
			</VStack>
		</Surface>
	);
}
