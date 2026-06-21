// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PoemAudioPlayer } from '../PoemAudioPlayer';

function getAudioElement(container: HTMLElement) {
	const audio = container.querySelector('audio');
	if (!audio) throw new Error('Expected audio element to be rendered.');
	return audio as HTMLAudioElement;
}

function setAudioMetadata(audio: HTMLAudioElement, duration: number) {
	Object.defineProperty(audio, 'duration', {
		configurable: true,
		value: duration,
	});
}

describe('FEATURE COMPONENT - Poems - PoemAudioPlayer', () => {
	beforeEach(() => {
		vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
		vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
		vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders title, source, controls, and initial time state', () => {
		const { container } = renderWithProviders(
			<PoemAudioPlayer src='/audio/river.mp3' title='River reading' />,
		);

		expect(screen.getByText('River reading')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Play audio' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Mute audio' })).toBeTruthy();
		expect(screen.getByLabelText('Volume')).toBeTruthy();
		expect(screen.getByLabelText('Progress')).toBeTruthy();
		expect(screen.getByText('0:00 / 0:00')).toBeTruthy();
		expect(container.querySelector('source')?.getAttribute('src')).toBe('/audio/river.mp3');
	});

	it('loads metadata and updates progress as audio time changes', () => {
		const { container } = renderWithProviders(
			<PoemAudioPlayer src='/audio/river.mp3' title='River reading' />,
		);
		const audio = getAudioElement(container);
		setAudioMetadata(audio, 125);

		fireEvent.loadedMetadata(audio);
		audio.currentTime = 65;
		fireEvent.timeUpdate(audio);

		expect(screen.getByText('1:05 / 2:05')).toBeTruthy();
		expect(screen.getByText('52%')).toBeTruthy();
	});

	it('plays and pauses audio from the main action', async () => {
		const { container } = renderWithProviders(<PoemAudioPlayer src='/audio/river.mp3' />);
		const audio = getAudioElement(container);

		Object.defineProperty(audio, 'paused', {
			configurable: true,
			value: true,
		});
		fireEvent.click(screen.getByRole('button', { name: 'Play audio' }));

		await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1));
		expect(await screen.findByRole('button', { name: 'Pause audio' })).toBeTruthy();

		Object.defineProperty(audio, 'paused', {
			configurable: true,
			value: false,
		});
		fireEvent.click(screen.getByRole('button', { name: 'Pause audio' }));

		expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('button', { name: 'Play audio' })).toBeTruthy();
	});

	it('seeks through the progress control', () => {
		const { container } = renderWithProviders(<PoemAudioPlayer src='/audio/river.mp3' />);
		const audio = getAudioElement(container);
		setAudioMetadata(audio, 100);
		fireEvent.loadedMetadata(audio);

		fireEvent.change(screen.getByLabelText('Progress'), {
			target: { value: '25' },
		});

		expect(audio.currentTime).toBe(25);
		expect(screen.getByText('0:25 / 1:40')).toBeTruthy();
	});

	it('mutes, unmutes, and restores volume when the volume slider changes', () => {
		const { container } = renderWithProviders(<PoemAudioPlayer src='/audio/river.mp3' />);
		const audio = getAudioElement(container);
		const volume = screen.getByLabelText('Volume') as HTMLInputElement;

		expect(volume.value).toBe('0.9');
		expect(audio.volume).toBe(0.9);

		fireEvent.click(screen.getByRole('button', { name: 'Mute audio' }));

		expect(audio.muted).toBe(true);
		expect(screen.getByRole('button', { name: 'Unmute audio' })).toBeTruthy();
		expect(volume.value).toBe('0');

		fireEvent.change(volume, {
			target: { value: '0.4' },
		});

		expect(audio.muted).toBe(false);
		expect(audio.volume).toBe(0.4);
		expect(screen.getByRole('button', { name: 'Mute audio' })).toBeTruthy();
		expect(volume.value).toBe('0.4');
	});

	it('resets playback and reloads audio when the source changes', () => {
		const { container, rerender } = renderWithProviders(<PoemAudioPlayer src='/audio/river.mp3' />);
		const audio = getAudioElement(container);
		setAudioMetadata(audio, 100);
		fireEvent.loadedMetadata(audio);
		audio.currentTime = 50;
		fireEvent.timeUpdate(audio);

		expect(screen.getByText('0:50 / 1:40')).toBeTruthy();

		rerender(<PoemAudioPlayer src='/audio/night.mp3' />);

		expect(HTMLMediaElement.prototype.load).toHaveBeenCalled();
		expect(screen.getByText('0:00 / 0:00')).toBeTruthy();
	});
});
