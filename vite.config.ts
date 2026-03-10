import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

function manualChunks(id: string) {
	if (!id.includes('node_modules')) return undefined;

	if (id.includes('@tanstack/react-query') || id.includes('zustand')) return 'data';

	if (
		id.includes('@chakra-ui') ||
		id.includes('@emotion') ||
		id.includes('framer-motion') ||
		id.includes('next-themes')
	)
		return 'ui';

	if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons';

	if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform/resolvers'))
		return 'forms';

	if (id.includes('react-markdown') || id.includes('remark-gfm')) return 'markdown';

	if (id.includes('react') || id.includes('scheduler')) return 'react';

	return 'vendor';
}

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	build: {
		rollupOptions: {
			output: {
				manualChunks,
			},
		},
	},
});
