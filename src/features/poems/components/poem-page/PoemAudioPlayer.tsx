import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

type PoemAudioPlayerProps = {
	src: string;
	title?: string;
};

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds)) return '0:00';
	const clamped = Math.max(0, Math.floor(seconds));
	const mins = Math.floor(clamped / 60);
	const secs = clamped % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PoemAudioPlayer({ src, title = 'Poem audio' }: PoemAudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(0.9);
	const [isMuted, setIsMuted] = useState(false);

	const progressValue = useMemo(() => {
		if (!duration) return 0;
		return Math.min(100, Math.max(0, (currentTime / duration) * 100));
	}, [currentTime, duration]);

	const handleLoadedMetadata = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
	}, []);

	const handleTimeUpdate = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		setCurrentTime(audio.currentTime || 0);
	}, []);

	const handleEnded = useCallback(() => {
		setIsPlaying(false);
	}, []);

	const togglePlay = useCallback(async () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			await audio.play();
			setIsPlaying(true);
			return;
		}
		audio.pause();
		setIsPlaying(false);
	}, []);

	const handleSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const audio = audioRef.current;
		if (!audio) return;
		const next = Number(event.target.value);
		audio.currentTime = Number.isFinite(next) ? next : 0;
		setCurrentTime(audio.currentTime);
	}, []);

	const handleVolumeChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const next = Number(event.target.value);
			const clamped = Math.min(1, Math.max(0, next));
			setVolume(clamped);
			if (clamped > 0 && isMuted) setIsMuted(false);
		},
		[isMuted],
	);

	const toggleMute = useCallback(() => {
		setIsMuted((prev) => !prev);
	}, []);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.volume = volume;
	}, [volume]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.muted = isMuted;
	}, [isMuted]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		audio.load();
	}, [src]);

	return (
		<Box
			p={4}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			sx={{
				'input[type="range"]': {
					WebkitAppearance: 'none',
					appearance: 'none',
					height: '6px',
					borderRadius: '999px',
					background: 'transparent',
					outline: 'none',
					accentColor: '#F472B6',
				},
				'input[type="range"]::-webkit-slider-runnable-track': {
					height: '6px',
					borderRadius: '999px',
					background:
						'linear-gradient(90deg, #F472B6 0%, #F472B6 var(--range-progress), rgba(255, 255, 255, 0.16) var(--range-progress), rgba(255, 255, 255, 0.16) 100%)',
				},
				'input[type="range"]::-webkit-slider-thumb': {
					WebkitAppearance: 'none',
					appearance: 'none',
					width: '14px',
					height: '14px',
					borderRadius: '999px',
					background: '#FBCFE8',
					border: '2px solid #F472B6',
					boxShadow: '0 0 0 3px rgba(251, 207, 232, 0.2)',
					cursor: 'pointer',
					marginTop: '-4px',
				},
				'input[type="range"]::-moz-range-thumb': {
					width: '14px',
					height: '14px',
					borderRadius: '999px',
					background: '#FBCFE8',
					border: '2px solid #F472B6',
					boxShadow: '0 0 0 3px rgba(251, 207, 232, 0.2)',
					cursor: 'pointer',
				},
				'input[type="range"]::-moz-range-track': {
					height: '6px',
					borderRadius: '999px',
					background: 'rgba(255, 255, 255, 0.16)',
				},
				'input[type="range"]::-moz-range-progress': {
					height: '6px',
					borderRadius: '999px',
					background: '#F472B6',
				},
				'input[type="range"][data-range="progress"]': {
					'--range-progress': '0%',
				},
				'input[type="range"][data-range="volume"]': {
					'--range-progress': '0%',
				},
			}}
		>
			<Text textStyle='small' color='pink.200' mb={2}>
				{title}
			</Text>
			<Flex align='center' justify='space-between' mb={3} gap={3} wrap='wrap'>
				<Flex align='center' gap={2}>
					<Button size='sm' variant='outlinePurple' onClick={togglePlay}>
						{isPlaying ? <PauseIcon /> : <PlayIcon />}
					</Button>
					<Text textStyle='small' color='pink.200'>
						{formatTime(currentTime)} / {formatTime(duration)}
					</Text>
				</Flex>
				<Flex align='center' gap={2}>
					<Button size='sm' variant='ghost' onClick={toggleMute}>
						{isMuted || volume === 0 ? <VolumeXIcon /> : <Volume2Icon />}
					</Button>
					<input
						type='range'
						min={0}
						max={1}
						step={0.01}
						value={isMuted ? 0 : volume}
						onChange={handleVolumeChange}
						aria-label='Volume'
						data-range='volume'
						style={
							{
								width: 120,
								'--range-progress': `${Math.round((isMuted ? 0 : volume) * 100)}%`,
							} as CSSProperties
						}
					/>
				</Flex>
			</Flex>

			<Flex align='center' gap={3}>
				<Text textStyle='smaller' color='pink.200'>
					{Math.round(progressValue)}%
				</Text>
				<input
					type='range'
					min={0}
					max={duration || 0}
					step={0.1}
					value={currentTime}
					onChange={handleSeek}
						aria-label='Progress'
					data-range='progress'
					style={
						{
							width: '100%',
							'--range-progress': `${Math.round(progressValue)}%`,
						} as CSSProperties
					}
					disabled={!duration}
				/>
			</Flex>

			<audio
				ref={audioRef}
				preload='metadata'
				onLoadedMetadata={handleLoadedMetadata}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
			>
				<source src={src} />
			</audio>
		</Box>
	);
}
