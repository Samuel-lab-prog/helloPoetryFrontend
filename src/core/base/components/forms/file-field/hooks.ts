import { useEffect, useState } from 'react';

export function useFilePreview(file?: File | null) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
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

	return previewUrl;
}
