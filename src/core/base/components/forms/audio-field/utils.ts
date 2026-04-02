import type { AudioFieldLabels } from './types';

export function pickAudioMimeType(): string {
	if (typeof MediaRecorder === 'undefined') return '';
	const candidates = [
		'audio/webm;codecs=opus',
		'audio/webm',
		'audio/ogg;codecs=opus',
		'audio/ogg',
		'audio/mpeg',
	];
	return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

export function resolveAudioLabels(labels?: AudioFieldLabels) {
	return {
		record: labels?.record ?? 'Record',
		stop: labels?.stop ?? 'Stop',
		discard: labels?.discard ?? 'Discard',
		upload: labels?.upload ?? 'Upload file',
		clear: labels?.clear ?? 'Clear file',
		previewRecorded: labels?.previewRecorded ?? 'Recording preview',
		previewUploaded: labels?.previewUploaded ?? 'Uploaded file preview',
	};
}
