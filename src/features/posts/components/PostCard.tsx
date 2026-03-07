import {
	Card,
	Flex,
	Text,
	Skeleton,
	SkeletonText,
	Stack,
	HStack,
	Link,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { formatDate } from '@features/base';

import { Tag } from './PostTag';
import type { PostPreviewType } from '../types/types';

type PostCardProps = {
	post: PostPreviewType;
};

export function PostCard({ post }: PostCardProps) {
	return (
		<Card.Root
			bg='gray.100'
			p={4}
			h='full'
		>
			<Card.Header
				p={0}
				mb={2}
			>
				<Card.Title
					as='h3'
					textStyle='h3'
				>
					{post.title}
				</Card.Title>

				<Card.Description
					textStyle='small'
					color='gray.500'
				>
					{post.excerpt}
				</Card.Description>
			</Card.Header>

			<Card.Body
				p={0}
				flex='1'
				gap={2}
			>
				<Flex
					gap={2}
					flexWrap='wrap'
				>
					{post.tags.map((tag) => (
						<Tag key={tag.id}>{tag.name}</Tag>
					))}
				</Flex>

				<Text
					textStyle='smaller'
					color='gray.600'
				>
					Criado em {formatDate(post.createdAt)}
				</Text>
			</Card.Body>

			<Card.Footer
				p={0}
				justifyContent='flex-end'
				mt={3}
			>
				<Link
					asChild
					color='black'
					textStyle='small'
					padding={2}
				>
					<NavLink to={`/posts/${post.slug}/${post.id}`}>Ler mais</NavLink>
				</Link>
			</Card.Footer>
		</Card.Root>
	);
}

export function PostCardSkeleton() {
	return (
		<Card.Root
			bg='gray.100'
			p={4}
			h='full'
		>
			<Stack
				gap={4}
				h='full'
				bg='gray.400'
			>
				<Stack gap={2}>
					<Skeleton
						height='20px'
						bg='white'
					/>
					<SkeletonText noOfLines={2} />
				</Stack>

				<HStack
					gap={2}
					flexWrap='wrap'
				>
					<Skeleton
						height='20px'
						width='60px'
						bg='gray.400'
					/>
					<Skeleton
						height='20px'
						width='80px'
						bg='gray.400'
					/>
					<Skeleton
						height='20px'
						width='50px'
						bg='gray.400'
					/>
				</HStack>

				<Skeleton
					height='12px'
					width='120px'
					bg='gray.400'
				/>

				<HStack
					justify='flex-end'
					mt='auto'
				>
					<Skeleton
						height='32px'
						width='80px'
						bg='gray.400'
					/>
				</HStack>
			</Stack>
		</Card.Root>
	);
}
