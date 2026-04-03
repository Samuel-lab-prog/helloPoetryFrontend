import { useEffect, useState } from 'react';
import type { PreviewSource } from './types';

export function useAudioPreview(file?: File | null) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewSource, setPreviewSource] = useState<PreviewSource>(null);

	useEffect(() => {
		if (!file) {
			setPreviewSource(null);
			setPreviewUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return null;
			});
			return;
		}

		const nextUrl = URL.createObjectURL(file);
		setPreviewUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return nextUrl;
		});

		return () => {
			URL.revokeObjectURL(nextUrl);
		};
	}, [file]);

	return {
		previewUrl,
		previewSource,
		setPreviewSource,
	};
}
