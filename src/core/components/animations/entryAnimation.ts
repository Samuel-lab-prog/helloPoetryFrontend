type EntryAnimationOptions = {
	baseDelayMs?: number;
	delayStepMs?: number;
	durationMs?: number;
};

export function getStaggeredEntryAnimationStyle(index: number, options: EntryAnimationOptions = {}) {
	const { baseDelayMs = 30, delayStepMs = 30, durationMs = 320 } = options;

	return {
		animationName: 'slide-from-bottom, fade-in',
		animationDuration: `${durationMs}ms`,
		animationTimingFunction: 'ease-out',
		animationFillMode: 'backwards',
		animationDelay: `${baseDelayMs + index * delayStepMs}ms`,
	} as const;
}
