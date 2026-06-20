import type { Keyframes } from '@emotion/react';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useTextAnimator } from '../useTextAnimator';

const wordFadeIn = 'fade-in' as unknown as Keyframes;

export function makeTextAnimatorScenario() {
	const scenario = {
		render(options: { prefersReducedMotion?: boolean; initialDelay?: number } = {}) {
			return renderHook(() =>
				useTextAnimator({
					prefersReducedMotion: options.prefersReducedMotion ?? false,
					initialDelay: options.initialDelay ?? 100,
					wordFadeIn,
				}),
			);
		},
		renderTextNodes(nodes: ReactNode[]) {
			return nodes;
		},
	};

	return scenario;
}
