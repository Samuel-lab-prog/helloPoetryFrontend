export function getHomeFeedEntryAnimationStyle(index: number) {
	return {
		animationName: 'slide-from-bottom, fade-in',
		animationDuration: '320ms',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'backwards',
		animationDelay: `${60 + index * 70}ms`,
	} as const;
}
