import React, { useRef, useEffect, useCallback } from 'react';

interface AudioVisualizerProps {
    analyserNode: AnalyserNode | null;
    label?: string;
    color?: string;
    height?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    analyserNode,
    label,
    color,
    height = 100
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationIdRef = useRef<number | undefined>(undefined);

    const getDefaultColor = useCallback((): string => '#f2b84b', []);

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

        ctx.fillStyle = 'rgba(10, 12, 19, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        const barWidth = 3;
        const barSpacing = 2;
        const barCount = Math.floor(canvas.width / (barWidth + barSpacing));
        const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(frequencyData);

        ctx.fillStyle = color || getDefaultColor();

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * frequencyData.length);
            const barHeight = (frequencyData[dataIndex] / 255) * (canvas.height * 0.6);
            const xPos = i * (barWidth + barSpacing);
            const yPos = (canvas.height - barHeight) / 2;

            ctx.globalAlpha = 0.3;
            ctx.fillRect(xPos, yPos, barWidth, barHeight);
            ctx.globalAlpha = 1;
        }

        animationIdRef.current = requestAnimationFrame(draw);
    }, [analyserNode, color, getDefaultColor]);

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
                <span className="mb-2 text-sm font-medium text-[var(--omni-text-muted)]">
                    {label}
                </span>
            )}
            <canvas
                ref={canvasRef}
                width={300}
                height={height}
                className="rounded-lg border border-[var(--omni-border)] bg-[rgba(10,12,19,0.85)]"
                style={{ width: '100%', maxWidth: 300, height }}
            />
        </div>
    );
};

export default AudioVisualizer;
