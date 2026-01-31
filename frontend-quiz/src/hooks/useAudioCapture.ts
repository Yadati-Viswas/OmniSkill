import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAudioCaptureReturn {
    isCapturing: boolean;
    analyserNode: AnalyserNode | null;
    startCapture: () => Promise<void>;
    stopCapture: () => void;
    getAudioData: () => Int16Array | null;
}

/**
 * Hook for capturing microphone audio and converting to 16-bit PCM at 16kHz
 */
export function useAudioCapture(onAudioData?: (data: Int16Array) => void): UseAudioCaptureReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

    const onAudioDataRef = useRef(onAudioData);

    useEffect(() => {
        onAudioDataRef.current = onAudioData;
    }, [onAudioData]);

    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const latestAudioDataRef = useRef<Int16Array | null>(null);

    const floatTo16BitPCM = useCallback((float32Array: Float32Array): Int16Array => {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }, []);

    const downsampleBuffer = useCallback((buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
        if (inputSampleRate === outputSampleRate) {
            return buffer;
        }
        const ratio = inputSampleRate / outputSampleRate;
        const newLength = Math.round(buffer.length / ratio);
        const result = new Float32Array(newLength);
        let offsetResult = 0;
        let offsetBuffer = 0;

        while (offsetResult < result.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
            let accum = 0;
            let count = 0;

            for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }

            result[offsetResult] = accum / count;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }

        return result;
    }, []);

    const startCapture = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                }
            });

            streamRef.current = stream;

            // Use the same context if it exists, or create new
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Create analyser for visualization
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            setAnalyserNode(analyser);

            // Create processor for audio data
            // Lower buffer size to 2048 for better latency (~128ms)
            const processor = audioContext.createScriptProcessor(2048, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const downsampled = downsampleBuffer(inputData, audioContext.sampleRate, 16000);
                const pcmData = floatTo16BitPCM(downsampled);

                latestAudioDataRef.current = pcmData;

                if (onAudioDataRef.current) {
                    onAudioDataRef.current(pcmData);
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsCapturing(true);
        } catch (error) {
            console.error('Failed to start audio capture:', error);
            throw error;
        }
    }, [floatTo16BitPCM, downsampleBuffer]); // Removed onAudioData from dependencies

    const stopCapture = useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setAnalyserNode(null);
        setIsCapturing(false);
        latestAudioDataRef.current = null;
    }, []);

    const getAudioData = useCallback(() => {
        return latestAudioDataRef.current;
    }, []);

    return {
        isCapturing,
        analyserNode,
        startCapture,
        stopCapture,
        getAudioData,
    };
}
