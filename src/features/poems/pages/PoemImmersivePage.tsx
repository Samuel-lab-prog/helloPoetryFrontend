/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import React, { isValidElement, useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { AsyncState, MarkdownRenderer } from '@features/base';
import { usePoem } from '../hooks/usePoem';
import { keyframes } from '@emotion/react';
import { useReducedMotion } from 'framer-motion';

function useTextAnimator({
	prefersReducedMotion,
	initialDelay,
	wordFadeIn,
}: {
	prefersReducedMotion: boolean;
	initialDelay: number;
	wordFadeIn: ReturnType<typeof keyframes>;
}) {
	return useMemo(() => {
		if (prefersReducedMotion) return null;
		let currentDelay = initialDelay;
		let globalIndex = 0;
		let hasRenderedBlock = false;
		const charDelayMs = 50;
		const animationDurationMs = 900;
		const blockGapMs = 0;
		let blockOffsetMs = initialDelay;

		const bumpDelay = (amount: number) => {
			currentDelay += amount;
		};

		const countAnimatedChars = (node: React.ReactNode): number => {
			if (typeof node === 'string') {
				let count = 0;
				for (const char of node) {
					if (char === '\n') continue;
					if (/\s/.test(char)) continue;
					count += 1;
				}
				return count;
			}
			if (Array.isArray(node)) {
				return node.reduce((total, child) => total + countAnimatedChars(child), 0);
			}
			if (isValidElement(node)) {
				const element = node as React.ReactElement<{ children?: React.ReactNode }>;
				return countAnimatedChars(element.props.children);
			}
			return 0;
		};

		const renderText = (value: string) =>
			value.split('').map((char) => {
				const key = `char-${globalIndex++}`;
				if (char === '\n') {
					bumpDelay(0);
					return char;
				}
				if (/\s/.test(char)) return char;
				const delay = currentDelay;
				currentDelay += charDelayMs;
				return (
					<Box
						key={key}
						as='span'
						display='inline-block'
						opacity={0}
						animation={`${wordFadeIn} ${animationDurationMs}ms forwards`}
						animationDelay={`${delay}ms`}
					>
						{char}
					</Box>
				);
			});

		const renderNode = (node: React.ReactNode): React.ReactNode => {
			if (typeof node === 'string') {
				return renderText(node);
			}
			if (Array.isArray(node)) {
				return node.map((child, index) => (
					<React.Fragment key={`node-${globalIndex++}-${index}`}>
						{renderNode(child)}
					</React.Fragment>
				));
			}
			if (isValidElement(node)) {
				const element = node as React.ReactElement<Record<string, unknown>>;
				const childProps = element.props as { children?: React.ReactNode };
				if (childProps?.children === null || childProps?.children === undefined) return node;
				const { children, ...rest } = element.props as {
					children?: React.ReactNode;
				} & Record<string, unknown>;
				return (
					<Box as={element.type as React.ElementType} {...rest}>
						{renderNode(children)}
					</Box>
				);
			}
			return node;
		};

		const onBlockStart = (node: React.ReactNode) => {
			if (!hasRenderedBlock) {
				hasRenderedBlock = true;
			}
			currentDelay = blockOffsetMs;
			const animatedChars = countAnimatedChars(node);
			const blockDurationMs =
				(animatedChars > 0 ? (animatedChars - 1) * charDelayMs : 0) + animationDurationMs;
			blockOffsetMs = currentDelay + blockDurationMs + blockGapMs;
		};

		return { renderText, renderNode, onBlockStart };
	}, [initialDelay, prefersReducedMotion, wordFadeIn]);
}

function useDedicationUsers(
	poem?: { toUsers?: { id?: number; nickname?: string; name?: string }[] },
) {
	return useMemo(() => {
		if (!poem?.toUsers?.length) return [];
		return poem.toUsers.filter(
			(user): user is { id: number; nickname?: string; name?: string } =>
				Number.isInteger(user.id)
		);
	}, [poem?.toUsers]);
}

function parsePoemId(rawId: string | undefined) {
	if (!rawId) return -1;
	const parsed = Number(rawId);
	if (!Number.isFinite(parsed) || parsed <= 0) return -1;
	return parsed;
}

export function PoemImmersivePage() {
	const { id } = useParams<{ id: string }>();
	const poemId = useMemo(() => parsePoemId(id), [id]);
	const { poem, isError, isLoading } = usePoem(poemId);
	const prefersReducedMotion = useReducedMotion() ?? false;
	const wordFadeIn = useMemo(
		() =>
			keyframes`
				from { opacity: 0; transform: translateY(2px); }
				to { opacity: 1; transform: translateY(0); }
			`,
		[],
	);
	const initialDelay = 0;
	const textAnimator = useTextAnimator({ prefersReducedMotion, initialDelay, wordFadeIn });
	const dedicationUsers = useDedicationUsers(poem);

	if (poemId <= 0) {
		return (
			<Flex as='main' minH='100vh' align='center' justify='center' p={6}>
				<Text textStyle='body'>ID de poema invalido.</Text>
			</Flex>
		);
	}

	return (
		<Box
			as='main'
			minH='100vh'
			bg='radial-gradient(circle at top, rgba(255,255,255,0.08) 0%, rgba(16,10,20,0.95) 55%, rgba(6,4,8,1) 100%)'
			color='pink.50'
			py={{ base: 12, md: 16 }}
			px={{ base: 4, md: 8 }}
		>
			<Flex direction='column' align='center'>
				<Box w='full' maxW='4xl'>
					<Link
						asChild
						display='inline-flex'
						alignItems='center'
						gap={2}
						mb={6}
						color='pink.200'
						_hover={{ color: 'pink.50' }}
					>
						<NavLink to={poem?.slug ? `/poems/${poem.slug}/${poem.id}` : `/poems/${poemId}`}>
							<ArrowLeftIcon /> Voltar ao poema
						</NavLink>
					</Link>

					<AsyncState
						isLoading={isLoading}
						isError={!!isError}
						isEmpty={!poem}
						emptyElement={<Text textStyle='body'>Poema nao encontrado.</Text>}
						errorElement={<Text textStyle='body'>Erro ao carregar o poema. Tente novamente.</Text>}
						loadingElement={<Text textStyle='body'>Carregando poema...</Text>}
					>
						{poem && (
							<Box>
								<Heading as='h1' textStyle='h1' color='pink.300' mb={3} textAlign='center'>
									{poem.title}
								</Heading>
								<Text textStyle='smaller' color='pink.200' textAlign='center' mb={10}>
									por {poem.author.name}
								</Text>

								<Box
									bg='rgba(255,255,255,0.04)'
									border='1px solid'
									borderColor='purple.700'
									borderRadius='2xl'
									p={{ base: 5, md: 8 }}
									boxShadow='0 30px 80px rgba(0,0,0,0.45)'
									display='flex'
									justifyContent='center'
									position='relative'
								>
									<Box
										textStyle='body'
										fontSize={{ base: '1.05rem', md: '1.2rem' }}
										lineHeight={{ base: '1.9', md: '2.1' }}
										letterSpacing='0.01em'
										whiteSpace='pre-wrap'
										textAlign='left'
										pb={{ base: 12, md: 14 }}
									>
										{prefersReducedMotion || !textAnimator ? (
											<MarkdownRenderer content={poem.content} />
										) : (
											<MarkdownRenderer
												content={poem.content}
												componentsOverride={{
													p: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Text as='p' textStyle='body' my={3}>
																{textAnimator.renderNode(children)}
															</Text>
														);
													},
													h1: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Heading as='h1' textStyle='h1' mt={8} mb={4}>
																{textAnimator.renderNode(children)}
															</Heading>
														);
													},
													h2: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Heading as='h2' textStyle='h2' mt={7} mb={3}>
																{textAnimator.renderNode(children)}
															</Heading>
														);
													},
													h3: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Heading as='h3' textStyle='h3' mt={6} mb={3}>
																{textAnimator.renderNode(children)}
															</Heading>
														);
													},
													h4: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Heading as='h4' textStyle='h4' mt={5} mb={2}>
																{textAnimator.renderNode(children)}
															</Heading>
														);
													},
													h5: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Heading as='h5' textStyle='h5' mt={4} mb={2}>
																{textAnimator.renderNode(children)}
															</Heading>
														);
													},
													h6: ({ children }) => {
														textAnimator.onBlockStart(children);
														return (
															<Heading as='h6' textStyle='h6' mt={4} mb={2}>
																{textAnimator.renderNode(children)}
															</Heading>
														);
													},
													li: ({ children }) => (
														<Box as='li' mb={1.5}>
															{textAnimator.renderNode(children)}
														</Box>
													),
												}}
											/>
										)}
									</Box>
									{dedicationUsers.length > 0 && (
										<Box
											position='absolute'
											bottom={{ base: 4, md: 5 }}
											right={{ base: 4, md: 6 }}
											textAlign='right'
											color='purple.200'
											opacity={0.9}
											pointerEvents='auto'
										>
											<Text
												textStyle='smaller'
												letterSpacing='0.12em'
												textTransform='uppercase'
												color='purple.200'
											>
												Dedicado a
											</Text>
											<Text
												textStyle='body'
												fontSize={{ base: '0.95rem', md: '1rem' }}
												color='pink.200'
											>
												{dedicationUsers.map((user, index) => {
													const label = user.nickname ? `@${user.nickname}` : user.name;
													return (
														<React.Fragment key={user.id}>
															<Link
																asChild
																color='pink.200'
																textDecoration='underline'
																textDecorationThickness='1px'
																textUnderlineOffset='3px'
																_hover={{ color: 'pink.50' }}
																_focusVisible={{
																	outline: '2px solid',
																	outlineColor: 'pink.200',
																	outlineOffset: '2px',
																}}
																cursor='pointer'
															>
																<NavLink to={`/authors/${user.id}`}>{label}</NavLink>
															</Link>
															{index < dedicationUsers.length - 1 && (
																<Text as='span' color='pink.200'>
																	,{' '}
																</Text>
															)}
														</React.Fragment>
													);
												})}
											</Text>
										</Box>
									)}
								</Box>
							</Box>
						)}
					</AsyncState>
				</Box>
			</Flex>
		</Box>
	);
}
