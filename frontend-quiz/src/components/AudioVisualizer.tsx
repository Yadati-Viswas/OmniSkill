import React, { useRef, useEffect, useCallback } from 'react';

interface AudioVisualizerProps {
    analyserNode: AnalyserNode | null;
    darkMode?: boolean;
    label?: string;
    color?: string;
    height?: number;
}

/**
 * Real-time audio waveform visualizer using canvas
 */
const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    analyserNode,
    darkMode = true,
    label,
    color,
    height = 100
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationIdRef = useRef<number | undefined>(undefined);

    const getDefaultColor = useCallback((): string => {
        return darkMode ? '#818cf8' : '#3b82f6'; // indigo-400 : blue-500
    }, [darkMode]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx || !analyserNode) {
            animationIdRef.current = requestAnimationFrame(draw);
            return;
        }

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        // Clear canvas
        ctx.fillStyle = darkMode ? '#1f2937' : '#e5e7eb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = color || getDefaultColor();
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Draw bars visualization overlay
        const barWidth = 3;
        const barSpacing = 2;
        const barCount = Math.floor(canvas.width / (barWidth + barSpacing));
        const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(frequencyData);

        ctx.fillStyle = color || getDefaultColor();

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * frequencyData.length);
            const barHeight = (frequencyData[dataIndex] / 255) * (canvas.height * 0.6);
            const x = i * (barWidth + barSpacing);
            const y = (canvas.height - barHeight) / 2;

            ctx.globalAlpha = 0.3;
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.globalAlpha = 1;
        }

        animationIdRef.current = requestAnimationFrame(draw);
    }, [analyserNode, darkMode, color, getDefaultColor]);

    useEffect(() => {
        animationIdRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [draw]);

    return (
        <div className="flex flex-col items-center">
            {label && (
                <span className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {label}
                </span>
            )}
            <canvas
                ref={canvasRef}
                width={300}
                height={height}
                className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                style={{ width: '100%', maxWidth: 300, height }}
            />
        </div>
    );
};

export default AudioVisualizer;
