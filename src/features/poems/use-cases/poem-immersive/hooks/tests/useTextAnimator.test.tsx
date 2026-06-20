// @vitest-environment happy-dom
import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import { makeTextAnimatorScenario } from './makeTextAnimatorScenario';

describe('FEATURE HOOK - Poems - useTextAnimator', () => {
	it('returns no animator when reduced motion is preferred', () => {
		const scenario = makeTextAnimatorScenario();

		const { result } = scenario.render({ prefersReducedMotion: true });

		expect(result.current).toBeNull();
	});

	it('wraps non-space characters with staggered animation delays', () => {
		const scenario = makeTextAnimatorScenario();

		const { result } = scenario.render({ initialDelay: 120 });
		const nodes = scenario.renderTextNodes(result.current?.renderText('A b') ?? []);
		const animatedNodes = nodes.filter(isValidElement);
		const firstProps = animatedNodes[0]?.props as { animationDelay?: string; children?: string };
		const secondProps = animatedNodes[1]?.props as { animationDelay?: string; children?: string };

		expect(animatedNodes).toHaveLength(2);
		expect(firstProps).toEqual(
			expect.objectContaining({
				animationDelay: '120ms',
				children: 'A',
			}),
		);
		expect(secondProps).toEqual(
			expect.objectContaining({
				animationDelay: '170ms',
				children: 'b',
			}),
		);
	});
});
