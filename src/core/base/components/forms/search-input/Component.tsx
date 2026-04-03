import { Field, Input } from '@chakra-ui/react';
import { useEffect } from 'react';

type SearchInputProps = {
	label: string;
	placeholder?: string;
	value: string;
	onValueChange: (value: string) => void;
	onDebouncedChange?: (value: string) => void;
	debounceMs?: number;
};

export function SearchInput({
	label,
	placeholder,
	value,
	onValueChange,
	onDebouncedChange,
	debounceMs = 250,
}: SearchInputProps) {
	useEffect(() => {
		if (!onDebouncedChange) return undefined;
		const timeoutId = window.setTimeout(() => {
			onDebouncedChange(value);
		}, debounceMs);

		return () => window.clearTimeout(timeoutId);
	}, [debounceMs, onDebouncedChange, value]);

	return (
		<Field.Root>
			<Field.Label textStyle='small' fontWeight='medium' color='text'>
				{label}
			</Field.Label>
			<Input
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
				placeholder={placeholder}
				textStyle='small'
				transition='all 0.22s ease'
				bg='rgba(255, 255, 255, 0.03)'
				borderColor='border'
				_hover={{
					borderColor: 'borderHover',
					bg: 'rgba(255, 255, 255, 0.05)',
				}}
				_focusVisible={{
					borderColor: 'pink.300',
					boxShadow: '0 0 0 3px rgba(255, 143, 189, 1)',
					bg: 'rgba(255, 255, 255, 0.06)',
				}}
				_focus={{
					borderColor: 'pink.300',
					bg: 'rgba(255, 255, 255, 0.06)',
				}}
			/>
		</Field.Root>
	);
}
