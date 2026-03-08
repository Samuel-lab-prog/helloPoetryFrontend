/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	Badge,
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	HStack,
	IconButton,
	Menu,
	Portal,
	Text,
	Textarea,
	Input,
	VStack,
} from '@chakra-ui/react';
import { EllipsisVertical } from 'lucide-react';
import { AsyncState, Surface, formatDate } from '@features/base';
import { useMyProfile } from '../hooks/useMyProfile';
import { useUpdateMyProfile } from '../hooks/useUpdateMyProfile';
import { useFriendRequestActions } from '@features/interactions';
import { useMyPoems, usePoemCollections, useSavedPoems } from '@features/poems';

function translateStatus(status: string) {
	switch (status) {
		case 'draft':
			return 'Rascunho';
		case 'published':
			return 'Publicado';
		default:
			return status;
	}
}

function translateVisibility(visibility: string) {
	switch (visibility) {
		case 'public':
			return 'Público';
		case 'friends':
			return 'Amigos';
		case 'private':
			return 'Privado';
		case 'unlisted':
			return 'Não listado';
		default:
			return visibility;
	}
}

export function MyProfilePage() {
	const navigate = useNavigate();
	const { profile, isLoading, isError, isMissingClient } = useMyProfile();
	const { updateMyProfile, isUpdatingProfile, updateProfileError, conflictField } =
		useUpdateMyProfile();
	const { acceptRequest, rejectRequest, isAccepting, isRejecting, errorMessage } =
		useFriendRequestActions();
	const {
		poems: myPoems,
		isLoading: isLoadingMyPoems,
		isError: isMyPoemsError,
	} = useMyPoems(!isMissingClient);
	const { savedPoems, isLoadingSavedPoems } = useSavedPoems(!isMissingClient);
	const {
		collections,
		isLoadingCollections,
		createCollection,
		deleteCollection,
		addPoemToCollection,
		removePoemFromCollection,
		isUpdatingCollections,
		collectionsError,
	} = usePoemCollections(!isMissingClient);
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [nameDraft, setNameDraft] = useState('');
	const [nicknameDraft, setNicknameDraft] = useState('');
	const [bioDraft, setBioDraft] = useState('');
	const [avatarUrlDraft, setAvatarUrlDraft] = useState('');
	const [collectionNameDraft, setCollectionNameDraft] = useState('');
	const [collectionDescriptionDraft, setCollectionDescriptionDraft] = useState('');
	const [collectionPoemIdDrafts, setCollectionPoemIdDrafts] = useState<Record<number, string>>({});

	useEffect(() => {
		if (!profile) return;
		setNameDraft(profile.name ?? '');
		setNicknameDraft(profile.nickname ?? '');
		setBioDraft(profile.bio ?? '');
		setAvatarUrlDraft(profile.avatarUrl ?? '');
	}, [profile]);

	if (isMissingClient) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<Surface
					w='full'
					maxW='2xl'
					p={{ base: 6, md: 8 }}
					variant='gradient'
					bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
				>
					<VStack align='start' gap={4}>
						<Badge colorPalette='pink' variant='subtle'>
							Perfil
						</Badge>
						<Heading as='h1' textStyle='h2'>
							Entre para ver seu perfil
						</Heading>
						<Text textStyle='body' color='pink.100'>
							Acompanhe poemas salvos, pedidos de amizade e suas estatísticas em um único lugar.
						</Text>
						<HStack gap={3} wrap='wrap'>
							<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
								<NavLink to='/login'>Entrar</NavLink>
							</Button>
							<Button
								size={{ base: 'sm', md: 'md' }}
								variant='solidPink'
								colorPalette='gray'
								asChild
							>
								<NavLink to='/register'>Criar conta</NavLink>
							</Button>
						</HStack>
					</VStack>
				</Surface>
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex
					mb={8}
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					direction={{ base: 'column', md: 'row' }}
					gap={3}
				>
					<Heading as='h1' textStyle='h2'>
						Meu Perfil
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
						<NavLink to='/login'>Entrar</NavLink>
					</Button>
				</Flex>

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={!profile}
					loadingElement={<Text textStyle='body'>Carregando perfil...</Text>}
					errorElement={<Text textStyle='body'>Erro ao carregar perfil.</Text>}
					emptyElement={<Text textStyle='body'>Perfil nao encontrado.</Text>}
				>
					{profile && (
						<Flex direction='column' gap={6}>
							<Surface
								p={{ base: 5, md: 6 }}
								variant='gradient'
								bg='linear-gradient(145deg, rgba(122,19,66,0.18) 0%, rgba(27,0,25,0.34) 100%)'
							>
								<Flex justify='space-between' align='start' gap={4}>
									<VStack align='start' gap={2} flex='1'>
										{isEditingProfile ? (
											<>
												<Input
													value={nameDraft}
													onChange={(e) => setNameDraft(e.target.value)}
													placeholder='Nome'
													bg='surface'
												/>
												<Input
													value={nicknameDraft}
													onChange={(e) => setNicknameDraft(e.target.value)}
													placeholder='Apelido'
													bg='surface'
													borderColor={conflictField === 'nickname' ? 'red.400' : undefined}
												/>
												{conflictField === 'nickname' && (
													<Text textStyle='smaller' color='red.400'>
														Este apelido já está em uso. Escolha outro.
													</Text>
												)}
												<Input
													value={avatarUrlDraft}
													onChange={(e) => setAvatarUrlDraft(e.target.value)}
													placeholder='URL do avatar'
													bg='surface'
												/>
												<Textarea
													value={bioDraft}
													onChange={(e) => setBioDraft(e.target.value)}
													placeholder='Bio'
													rows={4}
													bg='surface'
												/>
												{updateProfileError && (
													<Text textStyle='small' color='red.400'>
														{updateProfileError}
													</Text>
												)}
											</>
										) : (
											<>
												<Text textStyle='h3'>{profile.name}</Text>
												<Text textStyle='small' color='pink.200'>
													@{profile.nickname}
												</Text>
												<Text textStyle='small' color='pink.100'>
													{profile.email}
												</Text>
												<Text textStyle='body'>{profile.bio || 'Sem bio.'}</Text>
											</>
										)}
									</VStack>

									<Flex direction='column' gap={2}>
										{isEditingProfile ? (
											<>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													loading={isUpdatingProfile}
													onClick={async () => {
														try {
															await updateMyProfile({
																name: nameDraft.trim(),
																nickname: nicknameDraft.trim(),
																bio: bioDraft.trim(),
																avatarUrl: avatarUrlDraft.trim() || undefined,
															});
															setIsEditingProfile(false);
														} catch {
															// erro exibido por updateProfileError
														}
													}}
												>
													Salvar
												</Button>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													colorPalette='gray'
													onClick={() => {
														setIsEditingProfile(false);
														setNameDraft(profile.name ?? '');
														setNicknameDraft(profile.nickname ?? '');
														setBioDraft(profile.bio ?? '');
														setAvatarUrlDraft(profile.avatarUrl ?? '');
													}}
												>
													Cancelar
												</Button>
											</>
										) : (
											<Button
												size={{ base: 'xs', md: 'sm' }}
												variant='solidPink'
												onClick={() => setIsEditingProfile(true)}
											>
												Editar perfil
											</Button>
										)}
									</Flex>
								</Flex>
							</Surface>

							<Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
								<Box
									p={4}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='xl'
									bg='rgba(255, 255, 255, 0.02)'
								>
									<Text textStyle='smaller' color='pink.200'>
										Poemas
									</Text>
									<Text textStyle='h3'>{profile.stats.poemsIds.length}</Text>
								</Box>
								<Box
									p={4}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='xl'
									bg='rgba(255, 255, 255, 0.02)'
								>
									<Text textStyle='smaller' color='pink.200'>
										Comentarios
									</Text>
									<Text textStyle='h3'>{profile.stats.commentsIds.length}</Text>
								</Box>
								<Box
									p={4}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='xl'
									bg='rgba(255, 255, 255, 0.02)'
								>
									<Text textStyle='smaller' color='pink.200'>
										Amigos
									</Text>
									<Text textStyle='h3'>{profile.stats.friendsIds.length}</Text>
								</Box>
							</Grid>

							<Surface p={5} variant='panel'>
								<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
									Solicitacoes de amizade recebidas
								</Heading>

								<Flex direction='column' gap={3}>
									{profile.friendshipRequestsReceived.length === 0 && (
										<Text textStyle='small'>Nenhuma solicitacao pendente.</Text>
									)}

									{profile.friendshipRequestsReceived.map((request) => (
										<Flex
											key={request.requesterId}
											align={{ base: 'start', md: 'center' }}
											justify='space-between'
											direction={{ base: 'column', md: 'row' }}
											gap={3}
											p={3}
											border='1px solid'
											borderColor='purple.700'
											borderRadius='md'
										>
											<Text textStyle='small'>@{request.requesterNickname}</Text>
											<Flex gap={2}>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													onClick={() => acceptRequest(request.requesterId)}
													loading={isAccepting}
												>
													Aceitar
												</Button>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													colorPalette='gray'
													onClick={() => rejectRequest(request.requesterId)}
													loading={isRejecting}
												>
													Recusar
												</Button>
											</Flex>
										</Flex>
									))}
								</Flex>

								{errorMessage && (
									<Text mt={3} textStyle='small' color='red.400'>
										{errorMessage}
									</Text>
								)}
							</Surface>

							<Surface p={5} variant='panel'>
								<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
									Meus poemas
								</Heading>

								<Flex direction='column' gap={3}>
									{isLoadingMyPoems && <Text textStyle='small'>Carregando meus poemas...</Text>}
									{!isLoadingMyPoems && !isMyPoemsError && myPoems.length === 0 && (
										<Text textStyle='small'>Voce ainda nao publicou poemas.</Text>
									)}
									{isMyPoemsError && (
										<Text textStyle='small' color='red.400'>
											Erro ao carregar seus poemas.
										</Text>
									)}

									{myPoems.map((poem) => (
										<Flex
											key={poem.id}
											align='center'
											justify='space-between'
											gap={3}
											p={3}
											border='1px solid'
											borderColor='purple.700'
											borderRadius='md'
										>
											<Flex direction='column' gap={1} flex='1'>
												<Text textStyle='small'>{poem.title}</Text>
												<Text textStyle='smaller' color='pink.200'>
													{formatDate(poem.createdAt)} • {translateStatus(poem.status)} •{' '}
													{translateVisibility(poem.visibility)}
												</Text>
												{'stats' in poem && poem.stats && (
													<Text textStyle='smaller' color='pink.200'>
														{poem.stats.likesCount} curtidas • {poem.stats.commentsCount}{' '}
														comentários
													</Text>
												)}
												{poem.tags?.length > 0 && (
													<HStack gap={1} wrap='wrap'>
														{poem.tags.slice(0, 4).map((tag) => (
															<Badge key={tag.id} size='sm' colorPalette='pink' variant='subtle'>
																#{tag.name}
															</Badge>
														))}
													</HStack>
												)}
											</Flex>

											<Menu.Root positioning={{ placement: 'bottom-end' }}>
												<Menu.Trigger asChild>
													<IconButton
														aria-label='Abrir menu de acoes'
														variant='solidPink'
														size={{ base: 'xs', md: 'sm' }}
													>
														<EllipsisVertical />
													</IconButton>
												</Menu.Trigger>
												<Portal>
													<Menu.Positioner>
														<Menu.Content
															bg='rgba(27, 0, 25, 0.98)'
															border='1px solid'
															borderColor='purple.700'
														>
															<Menu.Item
																value={`open-${poem.id}`}
																color='pink.100'
																_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
																onClick={() => navigate(`/poems/${poem.slug}/${poem.id}`)}
															>
																Abrir
															</Menu.Item>
															<Menu.Item
																value={`update-${poem.id}`}
																color='pink.100'
																_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
																onClick={() => navigate(`/admin?mode=update&poemId=${poem.id}`)}
															>
																Atualizar
															</Menu.Item>
															<Menu.Item
																value={`delete-${poem.id}`}
																color='pink.100'
																_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
																onClick={() => navigate(`/admin?mode=delete&poemId=${poem.id}`)}
															>
																Deletar
															</Menu.Item>
														</Menu.Content>
													</Menu.Positioner>
												</Portal>
											</Menu.Root>
										</Flex>
									))}
								</Flex>
							</Surface>

							<Surface p={5} variant='panel'>
								<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
									Colecoes de poemas
								</Heading>

								<Flex direction='column' gap={3} mb={5}>
									<Input
										value={collectionNameDraft}
										onChange={(event) => setCollectionNameDraft(event.target.value)}
										placeholder='Nome da colecao'
										bg='surface'
									/>
									<Textarea
										value={collectionDescriptionDraft}
										onChange={(event) => setCollectionDescriptionDraft(event.target.value)}
										placeholder='Descricao da colecao'
										rows={3}
										bg='surface'
									/>
									<Button
										size={{ base: 'xs', md: 'sm' }}
										variant='solidPink'
										loading={isUpdatingCollections}
										onClick={async () => {
											if (!profile || !collectionNameDraft.trim()) return;
											await createCollection({
												userId: profile.id,
												name: collectionNameDraft.trim(),
												description: collectionDescriptionDraft.trim(),
											});
											setCollectionNameDraft('');
											setCollectionDescriptionDraft('');
										}}
									>
										Criar colecao
									</Button>
								</Flex>

								<Flex direction='column' gap={4}>
									{isLoadingCollections && <Text textStyle='small'>Carregando colecoes...</Text>}
									{!isLoadingCollections && collections.length === 0 && (
										<Text textStyle='small'>Voce ainda nao criou colecoes.</Text>
									)}

									{collections.map((collection) => (
										<Box
											key={collection.id}
											p={4}
											border='1px solid'
											borderColor='purple.700'
											borderRadius='md'
										>
											<Flex
												align={{ base: 'start', md: 'center' }}
												justify='space-between'
												direction={{ base: 'column', md: 'row' }}
												gap={3}
												mb={3}
											>
												<Flex direction='column' gap={1}>
													<Text textStyle='small'>{collection.name}</Text>
													<Text textStyle='smaller' color='pink.200'>
														{collection.description || 'Sem descricao.'}
													</Text>
													<Text textStyle='smaller' color='pink.200'>
														{collection.poemIds.length} poemas
													</Text>
												</Flex>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													colorPalette='gray'
													loading={isUpdatingCollections}
													onClick={() => deleteCollection(collection.id)}
												>
													Excluir
												</Button>
											</Flex>

											<Flex direction='column' gap={2} mb={3}>
												{collection.poemIds.length === 0 && (
													<Text textStyle='smaller' color='pink.200'>
														Nenhum poema nesta colecao.
													</Text>
												)}
												{collection.poemIds.map((poemId) => {
													const poem =
														myPoems.find((item) => item.id === poemId) ??
														savedPoems.find((item) => item.id === poemId);
													return (
														<Flex
															key={`${collection.id}-${poemId}`}
															align={{ base: 'start', md: 'center' }}
															justify='space-between'
															direction={{ base: 'column', md: 'row' }}
															gap={2}
															p={2}
															border='1px solid'
															borderColor='purple.800'
															borderRadius='md'
														>
															<Text textStyle='smaller' color='pink.100'>
																{poem ? poem.title : `Poema #${poemId}`}
															</Text>
															<Flex gap={2}>
																{poem?.slug && (
																	<Button
																		size={{ base: 'xs', md: 'sm' }}
																		variant='solidPink'
																		asChild
																	>
																		<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Abrir</NavLink>
																	</Button>
																)}
																<Button
																	size={{ base: 'xs', md: 'sm' }}
																	variant='solidPink'
																	colorPalette='gray'
																	loading={isUpdatingCollections}
																	onClick={() =>
																		removePoemFromCollection({
																			collectionId: collection.id,
																			poemId,
																		})
																	}
																>
																	Remover
																</Button>
															</Flex>
														</Flex>
													);
												})}
											</Flex>

											<Flex
												align={{ base: 'stretch', md: 'center' }}
												direction={{ base: 'column', md: 'row' }}
												gap={2}
											>
												<Input
													value={collectionPoemIdDrafts[collection.id] ?? ''}
													onChange={(event) =>
														setCollectionPoemIdDrafts((previous) => ({
															...previous,
															[collection.id]: event.target.value,
														}))
													}
													placeholder='ID do poema'
													inputMode='numeric'
													bg='surface'
												/>
												<Button
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													loading={isUpdatingCollections}
													onClick={async () => {
														const rawValue = collectionPoemIdDrafts[collection.id] ?? '';
														const poemId = Number(rawValue);
														if (!Number.isFinite(poemId) || poemId <= 0) return;
														await addPoemToCollection({
															collectionId: collection.id,
															poemId,
														});
														setCollectionPoemIdDrafts((previous) => ({
															...previous,
															[collection.id]: '',
														}));
													}}
												>
													Adicionar poema
												</Button>
											</Flex>
										</Box>
									))}
								</Flex>

								{collectionsError && (
									<Text mt={3} textStyle='small' color='red.400'>
										{collectionsError}
									</Text>
								)}
							</Surface>

							<Surface p={5} variant='panel'>
								<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
									Poemas salvos
								</Heading>

								<Flex direction='column' gap={3}>
									{isLoadingSavedPoems && (
										<Text textStyle='small'>Carregando poemas salvos...</Text>
									)}
									{!isLoadingSavedPoems && savedPoems.length === 0 && (
										<Text textStyle='small'>Voce ainda nao salvou poemas.</Text>
									)}

									{savedPoems.map((poem) => (
										<Flex
											key={poem.id}
											align={{ base: 'start', md: 'center' }}
											justify='space-between'
											direction={{ base: 'column', md: 'row' }}
											gap={3}
											p={3}
											border='1px solid'
											borderColor='purple.700'
											borderRadius='md'
										>
											<Flex direction='column' gap={1}>
												<Text textStyle='small'>{poem.title}</Text>
												<Text textStyle='smaller' color='pink.200'>
													Salvo em {formatDate(poem.savedAt)}
												</Text>
											</Flex>
											<Button size={{ base: 'xs', md: 'sm' }} variant='solidPink' asChild>
												<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Abrir</NavLink>
											</Button>
										</Flex>
									))}
								</Flex>
							</Surface>
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}
