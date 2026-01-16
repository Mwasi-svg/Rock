import { useCallback, useRef, useEffect } from 'react';

// Sound types available in the application
export type SoundType = 'click' | 'toggle' | 'success' | 'error' | 'pop' | 'swoosh';

// Global audio context (lazy initialized)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
};

// Sound configuration
const soundConfigs: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; gain: number }> = {
    click: { frequency: 1000, duration: 0.05, type: 'sine', gain: 0.1 },
    toggle: { frequency: 800, duration: 0.08, type: 'sine', gain: 0.08 },
    success: { frequency: 880, duration: 0.15, type: 'sine', gain: 0.1 },
    error: { frequency: 200, duration: 0.2, type: 'square', gain: 0.08 },
    pop: { frequency: 600, duration: 0.04, type: 'sine', gain: 0.12 },
    swoosh: { frequency: 400, duration: 0.12, type: 'sine', gain: 0.06 },
};

// Play a synthetic sound using Web Audio API
const playSyntheticSound = (type: SoundType) => {
    try {
        const ctx = getAudioContext();
        const config = soundConfigs[type];

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

        // For "success" sound, add a pleasant frequency sweep
        if (type === 'success') {
            oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + config.duration);
        }

        // For "swoosh" sound, add a downward sweep
        if (type === 'swoosh') {
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + config.duration);
        }

        gainNode.gain.setValueAtTime(config.gain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + config.duration);
    } catch (e) {
        // Silently fail if audio context is not available
        console.warn('Sound playback failed:', e);
    }
};

/**
 * Hook to play UI sounds with respect to user settings
 */
export function useSounds() {
    const enabledRef = useRef(true);

    // Check localStorage for sound setting
    useEffect(() => {
        const checkSetting = () => {
            try {
                // Check if sound effects are enabled in settings
                const stored = localStorage.getItem('rock-settings');
                if (stored) {
                    const settings = JSON.parse(stored);
                    enabledRef.current = settings.soundEffects !== false;
                }
            } catch {
                enabledRef.current = true;
            }
        };

        checkSetting();

        // Listen for storage changes
        window.addEventListener('storage', checkSetting);
        return () => window.removeEventListener('storage', checkSetting);
    }, []);

    const play = useCallback((type: SoundType) => {
        if (enabledRef.current) {
            playSyntheticSound(type);
        }
    }, []);

    return { play };
}

/**
 * Standalone function to play sounds (for use outside React components)
 */
export function playSound(type: SoundType) {
    try {
        const stored = localStorage.getItem('rock-settings');
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.soundEffects === false) return;
        }
        playSyntheticSound(type);
    } catch {
        playSyntheticSound(type);
    }
}
