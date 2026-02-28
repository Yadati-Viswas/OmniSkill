import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Session } from '@google/genai';
import { InterviewConfig, TranscriptEntry } from '../types';

interface ConnectOptions {
    preserveTranscript?: boolean;
    initialPrompt?: string;
}

interface UseGeminiLiveReturn {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    transcript: TranscriptEntry[];
    error: string | null;
    connect: (config: InterviewConfig, options?: ConnectOptions) => Promise<void>;
    reconnect: () => Promise<void>;
    disconnect: () => void;
    sendAudio: (pcmData: Int16Array) => void;
}

interface GeminiLiveCallbacks {
    onAudioChunk?: (base64Audio: string) => void;
}

const SESSION_REFRESH_MS = 9 * 60 * 1000;
const MAX_AUTO_RECONNECTS = 2;
const MAX_RESUME_PROMPT_CHARS = 6000;

export function useGeminiLive(callbacks: GeminiLiveCallbacks): UseGeminiLiveReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const clientRef = useRef<GoogleGenAI | null>(null);
    const sessionRef = useRef<Session | null>(null);
    const connectRef = useRef<((config: InterviewConfig, options?: ConnectOptions) => Promise<void>) | null>(null);

    const callbacksRef = useRef(callbacks);
    const transcriptRef = useRef<TranscriptEntry[]>([]);
    const configRef = useRef<InterviewConfig | null>(null);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionTokenRef = useRef(0);
    const reconnectAttemptsRef = useRef(0);

    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    const clearRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    const sendTextToSession = useCallback((session: Session, text: string) => {
        session.sendClientContent({
            turns: [{
                role: 'user',
                parts: [{ text }]
            }],
            turnComplete: true
        });
    }, []);

    const buildResumePrompt = useCallback((entries: TranscriptEntry[]): string => {
        const recent = entries.slice(-8)
            .map((entry) => `${entry.speaker === 'user' ? 'Candidate' : 'Interviewer'}: ${entry.text}`)
            .join('\n');

        if (!recent) {
            return 'We were briefly disconnected. Please continue the interview with the next question.';
        }

        return `We were disconnected and resumed in a new session.
Continue the same interview naturally from where we left off.
Recent context:
${recent}
Ask the next interview question now.`;
    }, []);

    const isRecoverableClose = useCallback((closeEvent: any): boolean => {
        const reason = String(closeEvent?.reason || '').toLowerCase();
        const code = closeEvent?.code;

        return code === 1011
            || reason.includes('failed to run inference')
            || reason.includes('tokenize')
            || reason.includes('internal')
            || reason.includes('session');
    }, []);

    const disconnect = useCallback(() => {
        clearRefreshTimer();
        reconnectAttemptsRef.current = 0;
        sessionTokenRef.current += 1;

        if (sessionRef.current) {
            try {
                console.log('🔌 Disconnecting Gemini Live session...');
                sessionRef.current.close();
            } catch (e) {
                console.warn('Error closing session:', e);
            }
        }

        sessionRef.current = null;
        clientRef.current = null;
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
    }, [clearRefreshTimer]);

    const handleMessage = useCallback((message: any) => {
        const serverContent = message.serverContent;
        if (!serverContent) return;

        if (serverContent.inputTranscription) {
            const inputTrans = serverContent.inputTranscription;
            const userText = typeof inputTrans === 'string'
                ? inputTrans
                : (inputTrans.text || inputTrans.transcript || '');

            if (userText && userText.trim()) {
                setTranscript(prev => {
                    const lastEntry = prev[prev.length - 1];
                    if (lastEntry && lastEntry.speaker === 'user' && (Date.now() - lastEntry.timestamp) < 5000) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastEntry, text: `${lastEntry.text} ${userText.trim()}` }
                        ];
                    }
                    return [...prev, { speaker: 'user', text: userText.trim(), timestamp: Date.now() }];
                });
            }
        }

        if (serverContent.modelTurn?.parts) {
            for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                    setIsSpeaking(true);
                    callbacksRef.current.onAudioChunk?.(part.inlineData.data);
                }

                if (part.text) {
                    setTranscript(prev => {
                        const lastEntry = prev[prev.length - 1];
                        if (lastEntry && lastEntry.speaker === 'ai') {
                            return [
                                ...prev.slice(0, -1),
                                { ...lastEntry, text: lastEntry.text + part.text }
                            ];
                        }
                        return [...prev, { speaker: 'ai', text: part.text, timestamp: Date.now() }];
                    });
                }
            }
        }

        if (serverContent.turnComplete) {
            setIsSpeaking(false);
            setIsListening(true);
        }
    }, []);

    const connect = useCallback(async (config: InterviewConfig, options: ConnectOptions = {}) => {
        clearRefreshTimer();
        sessionTokenRef.current += 1;
        const connectionToken = sessionTokenRef.current;

        if (sessionRef.current) {
            try {
                sessionRef.current.close();
            } catch (e) {
                console.warn('Error closing previous session:', e);
            }
            sessionRef.current = null;
        }

        clientRef.current = null;
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        setError(null);

        if (!options.preserveTranscript) {
            setTranscript([]);
        }

        configRef.current = config;

        try {
            console.log('🚀 Connecting to Gemini Live API...');
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not found');

            const client = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
            clientRef.current = client;

            const resumeContext = config.resumeText?.trim()
                ? config.resumeText.trim().slice(0, MAX_RESUME_PROMPT_CHARS)
                : '';
            const jobDescription = config.jobDescription?.trim() || '';

            const systemInstruction = `You are a professional interviewer for a ${config.role} position.
Experience Level: ${config.experienceLevel}.
Job Description: ${jobDescription || 'Not provided'}.
Resume Context: ${resumeContext || 'Not provided'}.

Your goal is to conduct a realistic specialized interview.
- Start with a polite greeting and introduction.
- Ask one relevant question at a time.
- Listen to the candidate's response.
- Provide brief feedback if needed, then move to the next question.
- Use job description and resume context when provided; otherwise infer likely responsibilities from the role and experience level.
- Keep your responses concise (under 30 seconds usually) as this is a voice conversation.
- Be encouraging but professional.`;

            const modelName = 'gemini-2.5-flash-native-audio-preview-12-2025';

            const connectedSession = await client.live.connect({
                model: modelName,
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Kore'
                            }
                        }
                    },
                    inputAudioTranscription: {}
                },
                callbacks: {
                    onopen: () => {
                        if (connectionToken !== sessionTokenRef.current) return;

                        console.log('✅ Connection Opened');
                        setIsConnected(true);
                        setIsListening(true);
                        reconnectAttemptsRef.current = 0;

                        clearRefreshTimer();
                        refreshTimerRef.current = setTimeout(() => {
                            if (connectionToken !== sessionTokenRef.current) return;

                            const latestConfig = configRef.current;
                            if (!latestConfig || !connectRef.current) return;

                            setError('Refreshing interview session to avoid provider timeout...');
                            const resumePrompt = buildResumePrompt(transcriptRef.current);
                            void connectRef.current(latestConfig, {
                                preserveTranscript: true,
                                initialPrompt: resumePrompt
                            });
                        }, SESSION_REFRESH_MS);
                    },
                    onmessage: (msg: any) => {
                        if (connectionToken !== sessionTokenRef.current) return;
                        handleMessage(msg);
                    },
                    onclose: (closeEvent: any) => {
                        if (connectionToken !== sessionTokenRef.current) return;

                        console.log('🔌 Connection Closed', closeEvent);
                        clearRefreshTimer();
                        setIsConnected(false);
                        setIsListening(false);
                        setIsSpeaking(false);

                        const reason = String(closeEvent?.reason || '').trim();
                        const closeCode = closeEvent?.code;

                        if (isRecoverableClose(closeEvent) && reconnectAttemptsRef.current < MAX_AUTO_RECONNECTS) {
                            reconnectAttemptsRef.current += 1;
                            const latestConfig = configRef.current;
                            const resumePrompt = buildResumePrompt(transcriptRef.current);

                            if (latestConfig && connectRef.current) {
                                setError(`Interview session closed (code ${closeCode}). Reconnecting...`);
                                setTimeout(() => {
                                    if (connectRef.current) {
                                        void connectRef.current(latestConfig, {
                                            preserveTranscript: true,
                                            initialPrompt: resumePrompt
                                        });
                                    }
                                }, 700);
                                return;
                            }
                        }

                        const readableReason = reason || 'No reason provided by server';
                        setError(`Connection closed (code ${closeCode ?? 'unknown'}): ${readableReason}`);
                    },
                    onerror: (err: any) => {
                        if (connectionToken !== sessionTokenRef.current) return;
                        console.error('❌ Connection Error:', err);
                        setError(err?.message || 'Connection error');
                    }
                }
            });

            if (connectionToken !== sessionTokenRef.current) {
                try {
                    connectedSession.close();
                } catch (e) {
                    console.warn('Error closing stale connected session:', e);
                }
                return;
            }

            sessionRef.current = connectedSession;

            const initialPrompt = options.initialPrompt
                ?? (!options.preserveTranscript ? 'Hello! I am ready for the interview.' : undefined);

            if (initialPrompt) {
                setTimeout(() => {
                    if (connectionToken !== sessionTokenRef.current) return;
                    try {
                        sendTextToSession(connectedSession, initialPrompt);
                    } catch (e) {
                        console.error('Failed to send initial prompt:', e);
                    }
                }, 500);
            }
        } catch (err: any) {
            if (connectionToken !== sessionTokenRef.current) return;
            console.error('Failed to connect:', err);
            setError(err?.message || 'Failed to connect');
            setIsConnected(false);
        }
    }, [buildResumePrompt, clearRefreshTimer, handleMessage, isRecoverableClose, sendTextToSession]);

    useEffect(() => {
        connectRef.current = connect;
        return () => {
            connectRef.current = null;
        };
    }, [connect]);

    const reconnect = useCallback(async () => {
        const latestConfig = configRef.current;
        if (!latestConfig) {
            setError('Cannot reconnect: interview configuration is missing.');
            return;
        }

        const resumePrompt = buildResumePrompt(transcriptRef.current);
        await connect(latestConfig, {
            preserveTranscript: true,
            initialPrompt: resumePrompt
        });
    }, [buildResumePrompt, connect]);

    const sendAudio = useCallback((pcmData: Int16Array) => {
        if (!sessionRef.current || !isConnected) return;

        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = '';
        const len = uint8.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        try {
            sessionRef.current.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64
                }
            });
        } catch (e) {
            console.error('Failed to send audio:', e);
        }
    }, [isConnected]);

    return {
        isConnected,
        isListening,
        isSpeaking,
        transcript,
        error,
        connect,
        reconnect,
        disconnect,
        sendAudio
    };
}
