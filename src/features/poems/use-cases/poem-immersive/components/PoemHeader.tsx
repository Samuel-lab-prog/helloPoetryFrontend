import { Heading, Text } from '@chakra-ui/react';

interface PoemHeaderProps {
	title: string;
	authorName: string;
}

export function PoemHeader({ title, authorName }: PoemHeaderProps) {
	return (
		<>
			<Heading as='h1' textStyle='h3' color='pink.300' mb={3} textAlign='center'>
				{title}
			</Heading>
			<Text textStyle='small' color='pink.200' textAlign='center' mb={8}>
				by {authorName}
			</Text>
		</>
	);
}
