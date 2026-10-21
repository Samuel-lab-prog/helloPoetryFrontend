import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave this page and discard them?';
const SAVING_MESSAGE =
	'Your save is still in progress. Leave this page and discard any unsaved changes?';

export function useUnsavedChangesPrompt(isDirty: boolean, isSaving = false) {
	const blocker = useBlocker(isDirty);

	useEffect(() => {
		if (blocker.state !== 'blocked') return;

		const shouldLeave = window.confirm(isSaving ? SAVING_MESSAGE : DEFAULT_MESSAGE);
		if (shouldLeave) {
			blocker.proceed();
			return;
		}

		blocker.reset();
	}, [blocker, isSaving]);

	useEffect(() => {
		if (!isDirty) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);
}
