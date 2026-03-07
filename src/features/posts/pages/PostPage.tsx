import { NavLink, useParams } from 'react-router-dom';
import { Box, Link, Flex, Icon } from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { AsyncState, MarkdownRenderer } from '@features/base';
import { usePost } from '../hooks/usePost';
import { PostHeader } from '../components/PostHeader';

export function PostPage() {
	const { id } = useParams<{ id: string }>();
	const { post, isError, isLoading } = usePost(Number(id));

	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
			alignItems='center'
		>
			<Box
				as='section'
				maxW='4xl'
				w='full'
			>
				<AsyncState
					isLoading={isLoading}
					isError={!!isError}
					isEmpty={!post}
					emptyElement={<Box textStyle='body'>Post não encontrado</Box>}
					errorElement={
						<Box textStyle='body'>
							Erro ao carregar o post. Tente novamente mais tarde
						</Box>
					}
					loadingElement={<Box textStyle='body'>Carregando post...</Box>}
				>
					{post && (
						<>
							<PostHeader
								post={{
									title: post.title,
									excerpt: post.excerpt,
									tags: post.tags,
									createdAt: post.createdAt,
									updatedAt: post.updatedAt,
								}}
							/>
							<Box
								as='article'
								textAlign='justify'
								mt={50}
								whiteSpace='pre-wrap'
								wordBreak='break-word'
								textStyle='small'
							>
								<MarkdownRenderer content={post.content} />
							</Box>
						</>
					)}
				</AsyncState>
				<Box
					mt={8}
					w='full'
					justifyContent={['end', undefined, undefined, 'center']}
					display='flex'
				>
					<Link
						px={4}
						py={2}
						asChild
						color='black'
					>
						<NavLink to='/'>
							<Icon as={ArrowLeftIcon} /> Voltar
						</NavLink>
					</Link>
				</Box>
			</Box>
		</Flex>
	);
}
