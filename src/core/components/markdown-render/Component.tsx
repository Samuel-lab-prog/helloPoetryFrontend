import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line no-duplicate-imports
import { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { components } from './components';

type MarkdownRendererProps = {
	content: string;
	componentsOverride?: Components;
};

/**
 * Renders Markdown content with default Chakra styles and optional overrides.
 */
export function MarkdownRenderer({ content, componentsOverride }: MarkdownRendererProps) {
	if (!content) return null;

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={componentsOverride ? { ...components, ...componentsOverride } : components}
		>
			{content}
		</ReactMarkdown>
	);
}
