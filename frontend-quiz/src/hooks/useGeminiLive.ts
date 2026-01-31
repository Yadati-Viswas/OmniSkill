import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Session } from '@google/genai';
import { InterviewConfig, TranscriptEntry } from '../types';

interface UseGeminiLiveReturn {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    transcript: TranscriptEntry[];
    error: string | null;
    connect: (config: InterviewConfig) => Promise<void>;
    disconnect: () => void;
    sendAudio: (pcmData: Int16Array) => void;
}

interface GeminiLiveCallbacks {
    onAudioChunk?: (base64Audio: string) => void;
}

export function useGeminiLive(callbacks: GeminiLiveCallbacks): UseGeminiLiveReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const clientRef = useRef<GoogleGenAI | null>(null);
    const sessionRef = useRef<Session | null>(null);

    // Store callbacks in ref to avoid dependency cycles or stale closures
    const callbacksRef = useRef(callbacks);
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    const disconnect = useCallback(() => {
        if (sessionRef.current) {
            try {
                console.log('🔌 Disconnecting Gemini Live session...');
                // The updated SDK likely has a close method or similar
                // sessionRef.current.close() is standard for the Session class
                sessionRef.current.close();
            } catch (e) {
                console.warn('Error closing session:', e);
            }
            sessionRef.current = null;
        }
        clientRef.current = null;
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
    }, []);

    const connect = useCallback(async (config: InterviewConfig) => {
        // Disconnect existing if any
        disconnect();
        setError(null);
        setTranscript([]);

        try {
            console.log('🚀 Connecting to Gemini Live API...');
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not found');

            const client = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
            clientRef.current = client;

            const systemInstruction = `You are a professional interviewer for a ${config.role} position. 
            Experience Level: ${config.experienceLevel}.
            Job Description: ${config.jobDescription}.
            
            Your goal is to conduct a realistic specialized interview.
            - Start with a polite greeting and introduction.
            - Ask one relevant question at a time.
            - Listen to the candidate's response.
            - Provide brief feedback if needed, then move to the next question.
            - Keep your responses concise (under 30 seconds usually) as this is a voice conversation.
            - Be encouraging but professional.`;

            // Connect using the 'live' module
            // Use 'gemini-2.0-flash-exp' as it is the standard for Multimodal Live currently.
            // If this fails with 1008 (Model not found), try 'models/gemini-2.0-flash-exp' or check API access.
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
                                voiceName: 'Kore' // Aoede, Charon, Fenrir, Kore, Puck
                            }
                        }
                    },
                    // Enable input audio transcription to get user speech as text
                    inputAudioTranscription: {}
                },
                callbacks: {
                    onopen: () => {
                        console.log('✅ Connection Opened');
                        setIsConnected(true);
                        setIsListening(true);
                    },
                    onmessage: (msg: any) => {
                        handleMessage(msg);
                    },
                    onclose: (e: any) => {
                        console.log('🔌 Connection Closed', e);
                        setIsConnected(false);
                        setIsListening(false);
                    },
                    onerror: (err: any) => {
                        console.error('❌ Connection Error:', err);
                        setError(err.message || 'Connection error');
                    }
                }
            });

            sessionRef.current = connectedSession;

            // Send initial greeting text after connection is established
            setTimeout(() => {
                sendText("Hello! I am ready for the interview.");
            }, 500);

        } catch (err: any) {
            console.error('Failed to connect:', err);
            setError(err.message);
            setIsConnected(false);
        }
    }, [disconnect]); // Dependencies

    const handleMessage = useCallback((message: any) => {
        const serverContent = message.serverContent;
        if (!serverContent) return;

        // 1. Handle User Input Transcription (the field is 'inputTranscription')
        if (serverContent.inputTranscription) {
            // Log the structure to understand it
            console.log('🎤 inputTranscription:', JSON.stringify(serverContent.inputTranscription));

            // Extract text - could be direct string, or nested in .text or .transcript
            const inputTrans = serverContent.inputTranscription;
            const userText = typeof inputTrans === 'string'
                ? inputTrans
                : (inputTrans.text || inputTrans.transcript || '');

            if (userText && userText.trim()) {
                setTranscript(prev => {
                    const lastEntry = prev[prev.length - 1];
                    // If the last entry is from the user and it's recent, append to it
                    if (lastEntry && lastEntry.speaker === 'user' && (Date.now() - lastEntry.timestamp) < 5000) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastEntry, text: lastEntry.text + ' ' + userText.trim() }
                        ];
                    }
                    // Otherwise start a new user entry
                    return [...prev, { speaker: 'user', text: userText.trim(), timestamp: Date.now() }];
                });
            }
        }

        // 2. Handle Model Audio and Text (AI response)
        if (serverContent.modelTurn?.parts) {
            for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                    setIsSpeaking(true);
                    callbacksRef.current.onAudioChunk?.(part.inlineData.data);
                }
                // AI Text Transcript
                if (part.text) {
                    setTranscript(prev => {
                        const lastEntry = prev[prev.length - 1];
                        // If the last entry is from the AI, append to it (streaming text)
                        if (lastEntry && lastEntry.speaker === 'ai') {
                            return [
                                ...prev.slice(0, -1),
                                { ...lastEntry, text: lastEntry.text + part.text }
                            ];
                        }
                        // Otherwise start a new AI entry
                        return [...prev, { speaker: 'ai', text: part.text, timestamp: Date.now() }];
                    });
                }
            }
        }

        // 3. Turn Complete
        if (serverContent.turnComplete) {
            setIsSpeaking(false);
            setIsListening(true);
        }
    }, []);

    const sendAudio = useCallback((pcmData: Int16Array) => {
        if (!sessionRef.current || !isConnected) return;

        // Convert Int16 -> Base64
        // Optimized loop
        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = '';
        const len = uint8.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        const session = sessionRef.current;

        try {
            // Use sendRealtimeInput for audio data
            session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64
                }
            });
        } catch (e) {
            console.error('Failed to send audio:', e);
        }

    }, [isConnected]);

    const sendText = useCallback((text: string) => {
        if (!sessionRef.current || !isConnected) {
            console.warn('⚠️ Cannot send text: Session not connected');
            return;
        }
        const session = sessionRef.current;
        try {
            console.log('Sending text:', text);
            // Use sendClientContent for text commands/turns
            session.sendClientContent({
                turns: [{
                    role: 'user',
                    parts: [{ text: text }]
                }],
                turnComplete: true
            });
        } catch (e) {
            console.error('Failed to send text:', e);
        }
    }, [isConnected]);

    return {
        isConnected,
        isListening,
        isSpeaking,
        transcript,
        error,
        connect,
        disconnect,
        sendAudio
    };
}
