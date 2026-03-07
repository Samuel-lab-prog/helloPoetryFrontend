import { NavLink, useParams } from 'react-router-dom';
import { Box, Link, Flex, Icon } from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { AsyncState, MarkdownRenderer } from '@features/base';
import { usePost } from '../hooks/usePost';
import { PostHeader } from '../components/PostHeader';

export function PostPage() {
	const { id } = useParams<{ id: string }>();
	const { poem, isError, isLoading } = usePost(Number(id));

	return (
		<Flex as='main' layerStyle='main' direction='column' alignItems='center'>
			<Box as='section' maxW='4xl' w='full'>
				<AsyncState
					isLoading={isLoading}
					isError={!!isError}
					isEmpty={!poem}
					emptyElement={<Box textStyle='body'>Poema nao encontrado</Box>}
					errorElement={
						<Box textStyle='body'>
							Erro ao carregar o poema. Tente novamente mais tarde
						</Box>
					}
					loadingElement={<Box textStyle='body'>Carregando poema...</Box>}
				>
					{poem && (
						<>
							<PostHeader
								poem={{
									title: poem.title,
									excerpt: poem.excerpt,
									tags: poem.tags,
									createdAt: poem.createdAt,
									updatedAt: poem.updatedAt,
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
								<MarkdownRenderer content={poem.content} />
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
					<Link px={4} py={2} asChild color='black'>
						<NavLink to='/poems'>
							<Icon as={ArrowLeftIcon} /> Voltar
						</NavLink>
					</Link>
				</Box>
			</Box>
		</Flex>
	);
}
