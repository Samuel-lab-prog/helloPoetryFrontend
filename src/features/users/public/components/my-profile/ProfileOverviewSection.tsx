import { Surface } from '@BaseComponents';
import { Avatar, Button, Flex, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { getAvatarFileError } from '../../../internal/utils/avatarUpload';
import { ProfileEditFields } from '../../../use-cases/my-profile/components/ProfileEditFields';
import { ProfileStatsGrid } from '../../../use-cases/my-profile/components/ProfileStatsGrid';
import { ProfileReadOnly } from './ProfileReadOnly';
import type { MyProfileViewModel } from './types';

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
		w: 'full',
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

	useEffect(
		() => () => {
			if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
		},
		[avatarPreviewUrl],
	);

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
		? (avatarPreviewUrl ?? profile.avatarUrl ?? undefined)
		: (profile.avatarUrl ?? undefined);

	return (
		<>
			<Surface
				p={{ base: 5, md: 6 }}
				variant='gradient'
				bg='linear-gradient(145deg, rgba(122,19,66,0.18) 0%, rgba(27,0,25,0.34) 100%)'
				position='relative'
			>
				<Flex
					justify='space-between'
					align='start'
					direction={{ base: 'column', md: 'row' }}
					gap={4}
				>
					<VStack align='start' gap={2} flex='1' w='full'>
						<Avatar.Root
							size='2xl'
							w={{ base: '6rem', md: '8rem' }}
							h={{ base: '6rem', md: '8rem' }}
						>
							<Avatar.Image src={displayAvatarUrl} />
							<Avatar.Fallback name={profile.name} />
						</Avatar.Root>

						{isEditingProfile ? (
							<ProfileEditFields
								profileInputStyles={profileInputStyles}
								nameDraft={nameDraft}
								nicknameDraft={nicknameDraft}
								bioDraft={bioDraft}
								avatarFile={avatarFile}
								avatarFileError={avatarFileError}
								conflictField={conflictField}
								updateProfileError={updateProfileError}
								onChangeName={setNameDraft}
								onChangeNickname={setNicknameDraft}
								onChangeBio={setBioDraft}
								onPickAvatar={handlePickAvatar}
							/>
						) : (
							<ProfileReadOnly profile={profile} />
						)}
					</VStack>

					<Flex
						direction='column'
						gap={2}
						w={{ base: 'full', md: 'auto' }}
						position={{ base: 'static', md: 'absolute' }}
						top={{ md: 5 }}
						right={{ md: 5 }}
						mt={{ base: 3, md: 0 }}
					>
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
									Save
								</Button>
								<Button
									size={{ base: 'xs', md: 'sm' }}
									variant='solidPink'
									colorPalette='gray'
									w={{ base: 'full', md: 'auto' }}
									onClick={handleCancelEdit}
								>
									Cancel
								</Button>
							</>
						) : (
							<Button
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								w={{ base: 'full', md: 'auto' }}
								onClick={() => setIsEditingProfile(true)}
							>
								Edit profile
							</Button>
						)}
					</Flex>
				</Flex>
			</Surface>

			<ProfileStatsGrid profile={profile} />
		</>
	);
}
