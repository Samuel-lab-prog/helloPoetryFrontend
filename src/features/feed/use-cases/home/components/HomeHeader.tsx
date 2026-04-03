import { Surface } from '@BaseComponents';
import { Heading, Text, VStack } from '@chakra-ui/react';

type HomeHeaderProps = {
	title?: string;
	subtitle: string;
};

export function HomeHeader({ title, subtitle }: HomeHeaderProps) {
	return (
		<Surface>
			<VStack align='start' gap={2}>
				{title ? (
					<Heading as='h1' textStyle='h2'>
						{title}
					</Heading>
				) : null}
				<Text color='pink.200'>{subtitle}</Text>
			</VStack>
		</Surface>
	);
}
