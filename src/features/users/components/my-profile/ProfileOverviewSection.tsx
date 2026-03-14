import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Flex, Grid, Input, Text, Textarea, VStack, VisuallyHidden } from '@chakra-ui/react';
import { Surface } from '@features/base';
import type { MyProfileViewModel } from './types';
import { getAvatarFileError, MAX_AVATAR_SIZE_MB } from '../../utils/avatarUpload';

type ProfileOverviewSectionProps = {
	profile: MyProfileViewModel;
	isUpdatingProfile: boolean;
	updateProfileError: string;
	conflictField: 'nickname' | null;
	onUpdateProfile: (input: {
		name?: string;
		nickname?: string;
		bio?: string;
		avatarFile?: File | null;
	}) => Promise<void>;
};

export function ProfileOverviewSection({
	profile,
	isUpdatingProfile,
	updateProfileError,
	conflictField,
	onUpdateProfile,
}: ProfileOverviewSectionProps) {
	const profileInputStyles = {
		textStyle: 'small',
		transition: 'all 0.22s ease',
		bg: 'rgba(255, 255, 255, 0.03)',
		borderColor: 'border',
		_hover: {
			borderColor: 'borderHover',
			bg: 'rgba(255, 255, 255, 0.05)',
		},
		_focusVisible: {
			borderColor: 'pink.300',
			boxShadow: '0 0 0 3px rgba(255, 143, 189, 1)',
			bg: 'rgba(255, 255, 255, 0.06)',
		},
		_focus: {
			borderColor: 'pink.300',
			bg: 'rgba(255, 255, 255, 0.06)',
		},
	} as const;

	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [nameDraft, setNameDraft] = useState('');
	const [nicknameDraft, setNicknameDraft] = useState('');
	const [bioDraft, setBioDraft] = useState('');
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
	const [avatarFileError, setAvatarFileError] = useState('');

	useEffect(() => {
		setNameDraft(profile.name ?? '');
		setNicknameDraft(profile.nickname ?? '');
		setBioDraft(profile.bio ?? '');
		setAvatarFile(null);
		setAvatarPreviewUrl(null);
		setAvatarFileError('');
	}, [profile]);

	useEffect(() => {
		return () => {
			if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
		};
	}, [avatarPreviewUrl]);

	function handleCancelEdit() {
		setIsEditingProfile(false);
		setNameDraft(profile.name ?? '');
		setNicknameDraft(profile.nickname ?? '');
		setBioDraft(profile.bio ?? '');
		setAvatarFile(null);
		setAvatarPreviewUrl(null);
		setAvatarFileError('');
	}

	function handlePickAvatar(file: File | null) {
		setAvatarFile(file);
		setAvatarPreviewUrl((current) => {
			if (current) URL.revokeObjectURL(current);
			return file ? URL.createObjectURL(file) : null;
		});

		if (!file) {
			setAvatarFileError('');
			return;
		}

		const error = getAvatarFileError(file);
		setAvatarFileError(error ?? '');
	}

	async function handleSaveProfile() {
		if (avatarFileError) return;

		await onUpdateProfile({
			name: nameDraft.trim(),
			nickname: nicknameDraft.trim(),
			bio: bioDraft.trim(),
			avatarFile,
		});
		setIsEditingProfile(false);
	}

	const displayAvatarUrl = isEditingProfile
		? avatarPreviewUrl ?? profile.avatarUrl ?? undefined
		: profile.avatarUrl ?? undefined;

	return (
		<>
			<Surface
				p={{ base: 5, md: 6 }}
				variant='gradient'
				bg='linear-gradient(145deg, rgba(122,19,66,0.18) 0%, rgba(27,0,25,0.34) 100%)'
			>
				<Flex
					justify='space-between'
					align='start'
					direction={{ base: 'column', md: 'row' }}
					gap={4}
				>
					<VStack align='start' gap={2} flex='1'>
						<Avatar.Root
							size='2xl'
							w={{ base: '6rem', md: '8rem' }}
							h={{ base: '6rem', md: '8rem' }}
						>
							<Avatar.Image src={displayAvatarUrl} />
							<Avatar.Fallback name={profile.name} />
						</Avatar.Root>

						{isEditingProfile ? (
							<>
								<Input
									value={nameDraft}
									onChange={(e) => setNameDraft(e.target.value)}
									placeholder='Nome'
									{...profileInputStyles}
								/>
								<Input
									value={nicknameDraft}
									onChange={(e) => setNicknameDraft(e.target.value)}
									placeholder='Apelido'
									{...profileInputStyles}
									borderColor={conflictField === 'nickname' ? 'red.400' : undefined}
									_focusVisible={
										conflictField === 'nickname'
											? {
													borderColor: 'error',
													boxShadow: '0 0 0 3px rgba(239, 68, 68, 1)',
													bg: 'rgba(255, 255, 255, 0.06)',
											  }
											: profileInputStyles._focusVisible
									}
									_focus={
										conflictField === 'nickname'
											? { borderColor: 'error', bg: 'rgba(255, 255, 255, 0.06)' }
											: profileInputStyles._focus
									}
								/>
								{conflictField === 'nickname' && (
									<Text textStyle='smaller' color='red.400'>
										Este apelido já está em uso. Escolha outro.
									</Text>
								)}

								<Flex direction='column' gap={2} w='full'>
									<Text textStyle='smaller' color='pink.200'>
										Avatar (arquivo)
									</Text>
									<Flex align='center' gap={3} wrap='wrap'>
									<Button as='label' size='sm' variant='outlinePurple' cursor='pointer'>
										Escolher arquivo
										<VisuallyHidden>
											<Input
												type='file'
												accept='image/*'
												onChange={(event) => {
													handlePickAvatar(event.target.files?.[0] ?? null);
												}}
											/>
										</VisuallyHidden>
									</Button>
									<Text textStyle='smaller' color='pink.200'>
										{avatarFile ? avatarFile.name : 'Nenhum arquivo selecionado'}
									</Text>
								</Flex>
									<Text textStyle='smaller' color='pink.200'>
										Tamanho máximo: {MAX_AVATAR_SIZE_MB}MB
									</Text>

									{avatarFileError && (
										<Text textStyle='smaller' color='red.400'>
											{avatarFileError}
										</Text>
									)}
								</Flex>

								<Textarea
									value={bioDraft}
									onChange={(e) => setBioDraft(e.target.value)}
									placeholder='Bio'
									rows={4}
									{...profileInputStyles}
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

					<Flex direction='column' gap={2} w={{ base: 'full', md: 'auto' }}>
						{isEditingProfile ? (
							<>
								<Button
									size={{ base: 'xs', md: 'sm' }}
									variant='solidPink'
									loading={isUpdatingProfile}
									w={{ base: 'full', md: 'auto' }}
									onClick={() => {
										void handleSaveProfile();
									}}
									disabled={!!avatarFileError}
								>
									Salvar
								</Button>
								<Button
									size={{ base: 'xs', md: 'sm' }}
									variant='solidPink'
									colorPalette='gray'
									w={{ base: 'full', md: 'auto' }}
									onClick={handleCancelEdit}
								>
									Cancelar
								</Button>
							</>
						) : (
							<Button
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								w={{ base: 'full', md: 'auto' }}
								onClick={() => setIsEditingProfile(true)}
							>
								Editar perfil
							</Button>
						)}
					</Flex>
				</Flex>
			</Surface>

			<Grid mt={5} templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
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
					<Text textStyle='h3'>{profile.stats?.poems?.length ?? 0}</Text>
				</Box>
				<Box
					p={4}
					border='1px solid'
					borderColor='purple.700'
					borderRadius='xl'
					bg='rgba(255, 255, 255, 0.02)'
				>
					<Text textStyle='smaller' color='pink.200'>
						Comentários
					</Text>
					<Text textStyle='h3'>{profile.stats?.commentsIds?.length ?? 0}</Text>
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
					<Text textStyle='h3'>{profile.stats?.friends?.length ?? 0}</Text>
				</Box>
			</Grid>
		</>
	);
}
