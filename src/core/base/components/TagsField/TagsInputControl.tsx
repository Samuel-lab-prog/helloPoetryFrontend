import { Field, TagsInput } from '@chakra-ui/react';
import { useState } from 'react';

type TagsInputControlProps = {
	selectedTags: string[];
	disabled?: boolean;
	hasError: boolean;
	maxTags: number;
	maxTagLength?: number;
	placeholder?: string;
	onValueChange: (value: string[]) => void;
};

export function TagsInputControl({
	selectedTags,
	disabled,
	hasError,
	maxTags,
	maxTagLength,
	placeholder,
	onValueChange,
}: TagsInputControlProps) {
	const [isFocused, setIsFocused] = useState(false);
	const tagsCount = selectedTags.length;
	const limitReached = tagsCount >= maxTags;

	return (
		<>
			<TagsInput.Root
				w='full'
				colorPalette='pink'
				animationName='fade-in'
				animationDuration='260ms'
				animationTimingFunction='ease-out'
				value={selectedTags}
				disabled={disabled}
				css={{
					"& [data-scope='tags-input'][data-part='item']": {
						background: 'rgba(122, 19, 66, 0.7) !important',
						color: 'var(--chakra-colors-pink-50) !important',
						borderColor: 'var(--chakra-colors-pink-400) !important',
					},
					"& [data-scope='tags-input'][data-part='itemPreview']": {
						background: 'transparent !important',
						color: 'var(--chakra-colors-pink-50) !important',
					},
				}}
				onValueChange={(details) => onValueChange(details.value)}
			>
				<TagsInput.Control
					bg='rgba(255, 255, 255, 0.03)'
					color='text'
					border='1px solid'
					borderColor={hasError ? 'error' : isFocused ? 'pink.300' : 'border'}
					borderRadius='md'
					px={2}
					py={2}
					minH='42px'
					transition='all 0.22s ease'
					_hover={{
						borderColor: hasError ? 'error' : 'borderHover',
						bg: 'rgba(255, 255, 255, 0.03)',
					}}
					_focusWithin={{
						borderColor: hasError ? 'error' : 'pink.300',
						boxShadow: hasError
							? '0 0 0 5px rgba(239, 68, 68, 0.25)'
							: '0 0 0 5px rgba(255, 143, 189, 0.25)',
						bg: 'rgba(255, 255, 255, 0.04)',
					}}
				>
					<TagsInput.Items>
						{selectedTags.map((tag: string, index: number) => (
							<TagsInput.Item
								key={index}
								index={index}
								value={tag}
								bg='rgba(122, 19, 66, 0.7)'
								color='pink.50'
								border='1px solid'
								borderColor='pink.400'
								borderRadius='full'
								animationName='fade-in'
								animationDuration='180ms'
								_highlighted={{
									bg: 'rgba(154, 26, 83, 0.82)',
									color: 'pink.50',
								}}
								_selected={{
									bg: 'rgba(154, 26, 83, 0.82)',
									color: 'pink.50',
								}}
							>
								<TagsInput.ItemPreview
									bg='transparent'
									color='pink.50'
									_highlighted={{
										color: 'pink.50',
									}}
								>
									<TagsInput.ItemText color='pink.50'>{tag}</TagsInput.ItemText>
									<TagsInput.ItemDeleteTrigger color='pink.200' _hover={{ color: 'pink.50' }} />
								</TagsInput.ItemPreview>
								<TagsInput.ItemInput bg='transparent' color='pink.50' />
							</TagsInput.Item>
						))}
					</TagsInput.Items>

					<TagsInput.Input
						placeholder={limitReached ? 'Limite de tags atingido' : (placeholder ?? 'Adicione uma tag')}
						bg='transparent'
						color='text'
						disabled={disabled || limitReached}
						maxLength={maxTagLength}
						_placeholder={{ color: 'pink.200' }}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
					/>
					<TagsInput.ClearTrigger
						color='pink.200'
						transition='color 0.2s ease'
						_hover={{ color: 'pink.50' }}
					/>
				</TagsInput.Control>
			</TagsInput.Root>

			<Field.HelperText color='pink.200' mt={1}>
				{tagsCount}/{maxTags} tags
			</Field.HelperText>
		</>
	);
}
