import { formatDate } from '@BaseComponents';
import { Tag } from './PoemTag';
import { Heading, Text, Flex, VStack } from '@chakra-ui/react';

type PoemHeaderProps = {
	poem: {
		title: string;
		excerpt: string | null;
		tags: { id: number; name: string }[];
		createdAt: string | Date;
		updatedAt: string | Date;
	};
};

export function PoemHeader({ poem }: PoemHeaderProps) {
	const { title, excerpt, tags, createdAt, updatedAt } = poem;

	return (
		<>
			<Heading as='h1' textStyle='h1' mb={[2, 3, 4]}>
				{title}
			</Heading>

			{excerpt && (
				<Text textStyle='body' my={[2, 3, 4]}>
					{excerpt}
				</Text>
			)}

			<Flex gap={[1.5, 2]} flexWrap='wrap' mb={[3, 4]}>
				{tags.map((tag) => (
					<Tag key={tag.id}>{tag.name}</Tag>
				))}
			</Flex>

			<VStack align='start'>
				<Text fontStyle='italic' textStyle='small'>
					Created on {formatDate(createdAt)}
				</Text>

				{updatedAt !== createdAt && (
					<Text textStyle='small' fontStyle='italic'>
						Last updated on {formatDate(updatedAt)}
					</Text>
				)}
			</VStack>
		</>
	);
}
