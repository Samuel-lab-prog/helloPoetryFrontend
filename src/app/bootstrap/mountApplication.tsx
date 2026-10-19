import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '../App';
import { AppProviders } from '../providers/AppProviders';
import { registerApplicationDependencies } from './registerApplicationDependencies';

export function mountApplication(element: HTMLElement) {
	registerApplicationDependencies();
	createRoot(element).render(
		<StrictMode>
			<AppProviders>
				<App />
			</AppProviders>
		</StrictMode>,
	);
}
