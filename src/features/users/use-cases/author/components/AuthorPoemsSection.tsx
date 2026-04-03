import { AsyncState, formatRelativeTime } from '@BaseComponents';
import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import type { PoemPreviewType } from '@root/features/poems/public/types';
import { NavLink } from 'react-router-dom';

import { LoadingAuthorPoemsSkeletons } from './skeletons/LoadingAuthorPoemsSkeletons';

type AuthorPoemsSectionProps = {
	poems: PoemPreviewType[];
	isLoading: boolean;
	isError: boolean;
};

export function AuthorPoemsSection({ poems, isLoading, isError }: AuthorPoemsSectionProps) {
	return (
		<>
			<Flex align='center' justify='space-between' gap={3} mb={4} wrap='wrap'>
				<Heading as='h2' textStyle='h3'>
					Author poems
				</Heading>
				<Text textStyle='small' color='pink.200'>
					{poems.length} {poems.length === 1 ? 'poem' : 'poems'}
				</Text>
			</Flex>

			<AsyncState
				isLoading={isLoading}
				isError={isError}
				isEmpty={poems.length === 0}
				loadingElement={LoadingAuthorPoemsSkeletons}
				errorElement={
					<Flex
						p={6}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='xl'
						bg='rgba(255, 255, 255, 0.02)'
					>
						<Text textStyle='body'>Error loading poems.</Text>
					</Flex>
				}
				emptyElement={
					<Flex
						p={6}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='xl'
						bg='rgba(255, 255, 255, 0.02)'
					>
						<Text textStyle='body'>No poems published.</Text>
					</Flex>
				}
			>
				<Flex direction='column' gap={3}>
					{poems.map((poem, index) => (
						<Box key={poem.id} w='full'>
							<Link
								asChild
								_hover={{ textDecoration: 'none' }}
								_focusVisible={{ boxShadow: 'none' }}
								display='block'
								w='full'
							>
								<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
									<Box
										borderBottom='1px solid'
										borderColor='purple.700'
										w='full'
										pt={2}
										pb={1}
										transition='background 0.2s ease, border-color 0.2s ease'
										_hover={{
											bg: 'rgba(255, 255, 255, 0.03)',
											borderColor: 'purple.500',
										}}
										_focusVisible={{
											outline: 'none',
											boxShadow: '0 0 0 2px rgba(255, 143, 189, 0.35)',
											bg: 'rgba(255, 255, 255, 0.04)',
										}}
										animationName='slide-from-bottom, fade-in'
										animationDuration='320ms'
										animationTimingFunction='ease-out'
										animationFillMode='backwards'
										animationDelay={`${30 + index * 30}ms`}
									>
										<Flex align='center' justify='space-between' gap={2}>
											<Flex direction='column' minW={0} gap={1}>
												<Text textStyle='small' color='pink.100' truncate>
													{poem.title}
												</Text>
												{poem.createdAt && (
													<Text textStyle='smaller' color='pink.200'>
														{formatRelativeTime(poem.createdAt)}
													</Text>
												)}
											</Flex>
										</Flex>
									</Box>
								</NavLink>
							</Link>
						</Box>
					))}
				</Flex>
			</AsyncState>
		</>
	);
}
