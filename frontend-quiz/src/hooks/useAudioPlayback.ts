import { useRef, useState, useCallback } from 'react';

interface UseAudioPlaybackReturn {
    isPlaying: boolean;
    analyserNode: AnalyserNode | null;
    playChunk: (base64PcmData: string) => void;
    stop: () => void;
    initialize: () => void;
}

/**
 * Hook for playing back PCM audio chunks from Gemini API with seamless scheduling
 */
export function useAudioPlayback(): UseAudioPlaybackReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const initialize = useCallback(() => {
        if (!audioContextRef.current) {
            const audioContext = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyser.connect(audioContext.destination);
            analyserRef.current = analyser;
            setAnalyserNode(analyser);

            nextStartTimeRef.current = audioContext.currentTime;
        }
    }, []);

    const base64ToInt16Array = useCallback((base64: string): Int16Array => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Int16Array(bytes.buffer);
    }, []);

    const int16ToFloat32 = useCallback((int16Array: Int16Array): Float32Array => {
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }
        return float32Array;
    }, []);

    const playChunk = useCallback((base64PcmData: string) => {
        if (!audioContextRef.current || !analyserRef.current) {
            console.warn('Audio context not initialized');
            return;
        }

        const audioContext = audioContextRef.current;
        const analyser = analyserRef.current;

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        try {
            const int16Data = base64ToInt16Array(base64PcmData);
            const float32Data = int16ToFloat32(int16Data);

            // Create audio buffer
            const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            // Create source node
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser);

            // Schedule playback for seamless audio
            const currentTime = audioContext.currentTime;
            const startTime = Math.max(currentTime, nextStartTimeRef.current);

            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;

            activeSourcesRef.current.add(source);
            setIsPlaying(true);

            source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) {
                    setIsPlaying(false);
                }
            };
        } catch (error) {
            console.error('Failed to play audio chunk:', error);
        }
    }, [base64ToInt16Array, int16ToFloat32]);

    const stop = useCallback(() => {
        activeSourcesRef.current.forEach(source => {
            try {
                source.stop();
            } catch {
                // Ignore errors from already stopped sources
            }
        });
        activeSourcesRef.current.clear();

        if (audioContextRef.current) {
            nextStartTimeRef.current = audioContextRef.current.currentTime;
        }

        setIsPlaying(false);
    }, []);

    return {
        isPlaying,
        analyserNode,
        playChunk,
        stop,
        initialize,
    };
}
