import {
	Button,
	Flex,
	Input,
	type SystemStyleObject,
	Text,
	Textarea,
	VisuallyHidden,
} from '@chakra-ui/react';

import { MAX_AVATAR_SIZE_MB } from '../../../internal/utils/avatarUpload';

type ProfileEditFieldsProps = {
	profileInputStyles: SystemStyleObject;
	nameDraft: string;
	nicknameDraft: string;
	bioDraft: string;
	avatarFile: File | null;
	avatarFileError: string;
	conflictField: 'nickname' | null;
	updateProfileError: string;
	onChangeName: (value: string) => void;
	onChangeNickname: (value: string) => void;
	onChangeBio: (value: string) => void;
	onPickAvatar: (file: File | null) => void;
};

export function ProfileEditFields({
	profileInputStyles,
	nameDraft,
	nicknameDraft,
	bioDraft,
	avatarFile,
	avatarFileError,
	conflictField,
	updateProfileError,
	onChangeName,
	onChangeNickname,
	onChangeBio,
	onPickAvatar,
}: ProfileEditFieldsProps) {
	return (
		<Flex direction='column' gap={2} w='full'>
			<Input
				value={nameDraft}
				onChange={(e) => onChangeName(e.target.value)}
				placeholder='Name'
				w='full'
				{...profileInputStyles}
			/>
			<Input
				value={nicknameDraft}
				onChange={(e) => onChangeNickname(e.target.value)}
				placeholder='Nickname'
				w='full'
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
					This nickname is already in use. Choose another.
				</Text>
			)}

			<Flex direction='column' gap={2} w='full'>
				<Text textStyle='smaller' color='pink.200'>
					Avatar (file)
				</Text>
				<Flex align='center' gap={3} wrap='wrap'>
					<Button as='label' size='sm' variant='outlinePurple' cursor='pointer'>
						Choose file
						<VisuallyHidden>
							<Input
								type='file'
								accept='image/*'
								onChange={(event) => {
									onPickAvatar(event.target.files?.[0] ?? null);
								}}
							/>
						</VisuallyHidden>
					</Button>
					<Text textStyle='smaller' color='pink.200'>
						{avatarFile ? avatarFile.name : 'No file selected'}
					</Text>
				</Flex>
				<Text textStyle='smaller' color='pink.200'>
					Max size: {MAX_AVATAR_SIZE_MB}MB
				</Text>

				{avatarFileError && (
					<Text textStyle='smaller' color='red.400'>
						{avatarFileError}
					</Text>
				)}
			</Flex>

			<Textarea
				value={bioDraft}
				onChange={(e) => onChangeBio(e.target.value)}
				placeholder='Bio'
				rows={4}
				w='full'
				{...profileInputStyles}
			/>
			{updateProfileError && (
				<Text textStyle='small' color='red.400'>
					{updateProfileError}
				</Text>
			)}
		</Flex>
	);
}
