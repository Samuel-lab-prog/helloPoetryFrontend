import { formatDate } from '@features/base';
import { Tag } from './PostTag';
import { Heading, Text, Flex, VStack } from '@chakra-ui/react';

type PostHeaderProps = {
	post: {
		title: string;
		excerpt: string;
		tags: { id: number; name: string }[];
		createdAt: string | Date;
		updatedAt: string | Date;
	};
};

export function PostHeader({ post }: PostHeaderProps) {
	const { title, excerpt, tags, createdAt, updatedAt } = post;

	return (
		<>
			<Heading
				as='h1'
				textStyle='h1'
				mb={[2, 3, 4]}
			>
				{title}
			</Heading>

			<Text
				textStyle='body'
				my={[2, 3, 4]}
			>
				{excerpt}
			</Text>

			<Flex
				gap={[1.5, 2]}
				flexWrap='wrap'
				mb={[3, 4]}
			>
				{tags.map((tag) => (
					<Tag key={tag.id}>{tag.name}</Tag>
				))}
			</Flex>

			<VStack align='start'>
				<Text
					fontStyle='italic'
					textStyle='small'
				>
					Criado em {formatDate(createdAt)}
				</Text>

				{updatedAt !== createdAt && (
					<Text
						fontSize={['xs', 'sm']}
						fontStyle='italic'
					>
						Última atualização em {formatDate(updatedAt)}
					</Text>
				)}
			</VStack>
		</>
	);
}
