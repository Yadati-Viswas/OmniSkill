import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Layout";
import { useAudioCapture } from "../../hooks/useAudioCapture";
import { useAudioPlayback } from "../../hooks/useAudioPlayback";
import { useGeminiLive } from "../../hooks/useGeminiLive";
import AudioVisualizer from "../AudioVisualizer";
import { InterviewConfig, InterviewFeedback, InterviewSession } from "../../types";
import { customAlphabet } from 'nanoid';
import { generateInterviewFeedbackApi, saveInterviewTranscriptApi } from "../../apis/allApis";
import { toast } from "react-toastify";
import {
    MicrophoneIcon,
    PhoneXMarkIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    SignalIcon,
    SignalSlashIcon
} from "@heroicons/react/24/solid";

const InterviewSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const config = (location.state as { config?: InterviewConfig })?.config;

    const [sessionId] = useState(() => customAlphabet('0123456789abcdef', 16)());
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isSavingSession, setIsSavingSession] = useState(false);

    const transcriptRef = useRef<HTMLDivElement>(null);

    const {
        isPlaying: isAiSpeaking,
        analyserNode: speakerAnalyser,
        playChunk,
        stop: stopPlayback,
        initialize: initializePlayback
    } = useAudioPlayback();

    const {
        isConnected,
        isListening,
        isSpeaking,
        transcript,
        error: geminiError,
        connect,
        reconnect,
        disconnect,
        sendAudio
    } = useGeminiLive({
        onAudioChunk: playChunk
    });

    const {
        isCapturing,
        analyserNode: micAnalyser,
        startCapture,
        stopCapture,
    } = useAudioCapture(sendAudio);

    useEffect(() => {
        if (!config) {
            navigate('/start-interview');
        }
    }, [config, navigate]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime]);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcript]);

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const createFallbackFeedback = (session: InterviewSession): InterviewFeedback => {
        const userResponses = session.transcript.filter(entry => entry.speaker === "user");
        const durationMs = (session.endTime ?? Date.now()) - session.startTime;
        const durationMinutes = durationMs > 0 ? Math.max(1, Math.round(durationMs / 60000)) : 0;
        const baseScore = Math.min(85, Math.max(45, 45 + userResponses.length * 4));

        return {
            interviewId: session.id,
            role: session.config.role,
            experienceLevel: session.config.experienceLevel,
            overallScore: baseScore,
            durationMinutes,
            totalQuestionsAnswered: userResponses.length,
            summary: "Detailed AI feedback is temporarily unavailable. This is a baseline score from your interview activity.",
            metrics: [
                { name: "Communication", score: baseScore, insight: "Improve answer structure with concise, outcome-driven examples." },
                { name: "Technical Relevance", score: baseScore - 3, insight: "Align answers closer with job description responsibilities." },
                { name: "Problem Solving", score: baseScore - 2, insight: "State assumptions, tradeoffs, and final decisions explicitly." },
                { name: "Confidence", score: baseScore, insight: "Use specific project outcomes to strengthen confidence." }
            ],
            strengths: ["You completed a full interview round and maintained engagement."],
            weaknesses: ["Automated AI analysis was unavailable for this session."],
            improvementTips: [
                "Practice 60-second STAR responses for your core projects.",
                "Map each answer directly to one job requirement.",
                "Finish answers with measurable outcomes."
            ],
            practicePlan: [
                "Do one mock round daily for the next 5 days.",
                "Review transcript after each round and improve weak answers.",
                "Track improvement by focusing on clarity and depth."
            ]
        };
    };

    const handleStartInterview = async () => {
        try {
            setPermissionError(null);
            initializePlayback();
            await startCapture();

            if (config) {
                await connect(config);
            }

            setIsActive(true);
        } catch (error) {
            console.error('Failed to start interview:', error);
            if (error instanceof Error && error.name === 'NotAllowedError') {
                setPermissionError('Microphone access denied. Please allow microphone access to start the interview.');
            } else {
                setPermissionError(error instanceof Error ? error.message : 'Failed to start interview');
            }
        }
    };

    const confirmEndInterview = async () => {
        if (isSavingSession) return;
        setIsSavingSession(true);

        stopCapture();
        stopPlayback();
        disconnect();
        setIsActive(false);
        setShowEndConfirm(false);

        const session: InterviewSession = {
            id: sessionId,
            config: config!,
            transcript,
            startTime,
            endTime: Date.now()
        };

        let persistedSession: InterviewSession = session;

        try {
            const saveResponse = await saveInterviewTranscriptApi(session);
            persistedSession = {
                ...session,
                id: saveResponse.data.id || session.id
            };
            toast.success("Interview session saved.");
        } catch (error) {
            console.error('Failed to save interview:', error);
            toast.error("Interview ended, but transcript could not be saved to the server.");
        }

        let feedback: InterviewFeedback;
        try {
            const feedbackResponse = await generateInterviewFeedbackApi({
                interviewId: persistedSession.id,
                config: persistedSession.config,
                transcript: persistedSession.transcript,
                startTime: persistedSession.startTime,
                endTime: persistedSession.endTime
            });
            feedback = feedbackResponse.data;
            toast.success("Interview feedback is ready.");
        } catch (error) {
            console.error('Failed to generate interview feedback:', error);
            toast.error("Could not generate AI feedback. Showing baseline analytics.");
            feedback = createFallbackFeedback(persistedSession);
        } finally {
            setIsSavingSession(false);
        }

        navigate('/interview-feedback', {
            state: {
                session: persistedSession,
                feedback
            }
        });
    };

    const handleReconnect = async () => {
        if (!isActive) return;
        try {
            await reconnect();
        } catch (error) {
            console.error('Failed to reconnect interview session:', error);
        }
    };

    if (!config) {
        return null;
    }

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#fff8eb]">Mock Interview</h1>
                        <p className="text-sm text-[var(--omni-text-muted)]">
                            {config.role} • {config.experienceLevel} Level
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="chip flex items-center gap-2 rounded-full px-4 py-2">
                            <ClockIcon className="h-5 w-5 text-[var(--omni-accent)]" />
                            <span className="font-mono font-bold text-[#fff8eb]">{formatTime(elapsedTime)}</span>
                        </div>

                        <div className={`chip flex items-center gap-2 rounded-full px-4 py-2 ${isConnected ? "border-[var(--omni-success)]/50" : "border-[var(--omni-danger)]/50"}`}>
                            {isConnected ? (
                                <>
                                    <SignalIcon className="h-5 w-5 text-[var(--omni-success)]" />
                                    <span className="text-sm font-medium text-[var(--omni-success)]">Connected</span>
                                </>
                            ) : (
                                <>
                                    <SignalSlashIcon className="h-5 w-5 text-[var(--omni-danger)]" />
                                    <span className="text-sm font-medium text-[var(--omni-danger)]">Disconnected</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {(permissionError || geminiError) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="surface-muted rounded-xl border border-[var(--omni-danger)]/50 p-4"
                    >
                        <p className="text-[var(--omni-danger)]">{permissionError || geminiError}</p>
                        {!permissionError && isActive && !isConnected && (
                            <button
                                onClick={handleReconnect}
                                className="btn-secondary mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
                            >
                                Reconnect Session
                            </button>
                        )}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="surface-card rounded-2xl p-6 lg:col-span-1">
                        <h3 className="mb-4 flex items-center font-semibold text-[#fff8eb]">
                            <MicrophoneIcon className="mr-2 h-5 w-5 text-[var(--omni-accent)]" />
                            Audio Streams
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <AudioVisualizer analyserNode={micAnalyser} label="Your Voice" color="#34d399" height={80} />
                                <div className="mt-2 flex items-center justify-center">
                                    {isCapturing ? (
                                        <span className="flex items-center text-sm text-[var(--omni-success)]">
                                            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[var(--omni-success)]" />
                                            Listening
                                        </span>
                                    ) : (
                                        <span className="text-sm text-[var(--omni-text-muted)]">Mic Off</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <AudioVisualizer analyserNode={speakerAnalyser} label="AI Interviewer" color="#f2b84b" height={80} />
                                <div className="mt-2 flex items-center justify-center">
                                    {isSpeaking || isAiSpeaking ? (
                                        <span className="flex items-center text-sm text-[var(--omni-accent-strong)]">
                                            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[var(--omni-accent-strong)]" />
                                            Speaking
                                        </span>
                                    ) : (
                                        <span className="text-sm text-[var(--omni-text-muted)]">Idle</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="surface-muted mt-6 rounded-xl p-4 text-center text-sm">
                            {!isActive ? (
                                <p className="text-[var(--omni-accent-strong)]">Ready to start</p>
                            ) : isListening ? (
                                <p className="text-[var(--omni-success)]">Your turn to speak</p>
                            ) : isSpeaking || isAiSpeaking ? (
                                <p className="text-[var(--omni-accent-strong)]">AI is responding...</p>
                            ) : (
                                <p className="text-[var(--omni-text-muted)]">Processing...</p>
                            )}
                        </div>
                    </div>

                    <div className="surface-card rounded-2xl p-6 lg:col-span-2">
                        <h3 className="mb-4 flex items-center font-semibold text-[#fff8eb]">
                            <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5 text-[var(--omni-accent)]" />
                            Live Transcript
                        </h3>

                        <div
                            ref={transcriptRef}
                            className="surface-muted max-h-[420px] min-h-[300px] flex-1 space-y-3 overflow-y-auto rounded-xl p-4"
                        >
                            {transcript.length === 0 ? (
                                <div className="py-8 text-center text-[var(--omni-text-muted)]">
                                    <ChatBubbleLeftRightIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                    <p>Transcript will appear here during the interview.</p>
                                </div>
                            ) : (
                                transcript.map((entry, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-xl p-3 ${entry.speaker === 'user'
                                                ? 'bg-[rgba(52,211,153,0.2)] text-[#d1fae5]'
                                                : 'bg-[rgba(242,184,75,0.2)] text-[#ffefcc]'
                                            }`}
                                        >
                                            <p className="mb-1 text-xs font-semibold opacity-70">
                                                {entry.speaker === 'user' ? 'You' : 'Interviewer'}
                                            </p>
                                            <p className="text-sm">{entry.text}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    {!isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleStartInterview}
                            className="btn-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg"
                        >
                            <MicrophoneIcon className="h-6 w-6" />
                            <span>Start Interview</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowEndConfirm(true)}
                            className="btn-danger flex items-center gap-2 rounded-xl px-8 py-4 text-lg"
                        >
                            <PhoneXMarkIcon className="h-6 w-6" />
                            <span>End Interview</span>
                        </motion.button>
                    )}
                </div>

                {showEndConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="surface-card w-full max-w-md rounded-2xl p-6"
                        >
                            <h3 className="mb-3 text-xl font-bold text-[#fff8eb]">End Interview?</h3>
                            <p className="mb-6 text-[var(--omni-text-muted)]">
                                Are you sure you want to end the interview? Your transcript will be saved.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowEndConfirm(false)} className="btn-secondary flex-1 rounded-xl py-3 font-semibold">
                                    Continue
                                </button>
                                <button onClick={confirmEndInterview} className="btn-danger flex-1 rounded-xl py-3">
                                    {isSavingSession ? "Saving..." : "End Interview"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.section>
        </Layout>
    );
};

export default InterviewSessionPage;
