import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Layout";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import { useAudioCapture } from "../../hooks/useAudioCapture";
import { useAudioPlayback } from "../../hooks/useAudioPlayback";
import { useGeminiLive } from "../../hooks/useGeminiLive";
import AudioVisualizer from "../AudioVisualizer";
import { InterviewConfig, TranscriptEntry, InterviewSession } from "../../types";
import { customAlphabet } from 'nanoid';
import { saveInterviewTranscriptApi } from "../../apis/allApis";
import {
    MicrophoneIcon,
    StopIcon,
    PhoneXMarkIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    SignalIcon,
    SignalSlashIcon
} from "@heroicons/react/24/solid";

const InterviewSessionPage: React.FC = () => {
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();
    const location = useLocation();

    const config = (location.state as { config?: InterviewConfig })?.config;

    const [sessionId] = useState(() => customAlphabet('0123456789abcdef', 16)());
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const transcriptRef = useRef<HTMLDivElement>(null);

    // 1. Audio Playback (Sink)
    const {
        isPlaying: isAiSpeaking,
        analyserNode: speakerAnalyser,
        playChunk,
        stop: stopPlayback,
        initialize: initializePlayback
    } = useAudioPlayback();

    // 2. Gemini Live API (Logic/Connection)
    const {
        isConnected,
        isListening,
        isSpeaking,
        transcript,
        error: geminiError,
        connect,
        disconnect,
        sendAudio
    } = useGeminiLive({
        onAudioChunk: playChunk
    });

    // 3. Audio Capture (Source) - driven by sendAudio callback
    const {
        isCapturing,
        analyserNode: micAnalyser,
        startCapture,
        stopCapture,
        getAudioData
    } = useAudioCapture(sendAudio);

    // Redirect if no config
    useEffect(() => {
        if (!config) {
            navigate('/start-interview');
        }
    }, [config, navigate]);

    // Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime]);

    // Auto-scroll transcript
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcript]);

    // REMOVED: Polling useEffect for audio
    // Audio is now sent directly via useAudioCapture callback

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleStartInterview = async () => {
        try {
            setPermissionError(null);

            // Initialize playback first
            initializePlayback();

            // Start microphone capture
            await startCapture();

            // Connect to Gemini
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

    const handleEndInterview = () => {
        setShowEndConfirm(true);
    };

    const confirmEndInterview = async () => {
        // Stop everything
        stopCapture();
        stopPlayback();
        disconnect();
        setIsActive(false);
        setShowEndConfirm(false);

        // Create session object for saving
        const session: InterviewSession = {
            id: sessionId,
            config: config!,
            transcript: transcript,
            startTime: startTime,
            endTime: Date.now()
        };

        // Save to backend
        try {
            await saveInterviewTranscriptApi(session);
            console.log('✅ Interview saved successfully');
        } catch (error) {
            console.error('❌ Failed to save interview:', error);
        }

        // Navigate to summary/results page
        navigate('/start-interview', {
            state: {
                completedSession: session
            }
        });
    };

    const cancelEndInterview = () => {
        setShowEndConfirm(false);
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
                className={`flex flex-col space-y-6 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
                {/* Header with Status */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Mock Interview</h1>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {config.role} • {config.experienceLevel} Level
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Timer */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-200"
                            }`}>
                            <ClockIcon className={`h-5 w-5 ${darkMode ? "text-indigo-400" : "text-blue-600"}`} />
                            <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
                        </div>

                        {/* Connection Status */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isConnected
                            ? darkMode ? "bg-green-900/30" : "bg-green-100"
                            : darkMode ? "bg-red-900/30" : "bg-red-100"
                            }`}>
                            {isConnected ? (
                                <>
                                    <SignalIcon className="h-5 w-5 text-green-500" />
                                    <span className="text-green-500 text-sm font-medium">Connected</span>
                                </>
                            ) : (
                                <>
                                    <SignalSlashIcon className="h-5 w-5 text-red-500" />
                                    <span className="text-red-500 text-sm font-medium">Disconnected</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Messages */}
                {(permissionError || geminiError) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl ${darkMode ? "bg-red-900/30 border border-red-700" : "bg-red-100 border border-red-300"}`}
                    >
                        <p className="text-red-500">{permissionError || geminiError}</p>
                    </motion.div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Visualizers */}
                    <div className={`lg:col-span-1 p-6 rounded-2xl ${darkMode ? "bg-[#23272f]" : "bg-white"} shadow-xl`}>
                        <h3 className={`font-semibold mb-4 flex items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            <MicrophoneIcon className="h-5 w-5 mr-2" />
                            Audio Streams
                        </h3>

                        <div className="space-y-6">
                            {/* User Mic Visualizer */}
                            <div>
                                <AudioVisualizer
                                    analyserNode={micAnalyser}
                                    darkMode={darkMode}
                                    label="Your Voice"
                                    color={darkMode ? "#10b981" : "#059669"}
                                    height={80}
                                />
                                <div className="flex items-center justify-center mt-2">
                                    {isCapturing ? (
                                        <span className="flex items-center text-green-500 text-sm">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                            Listening
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 text-sm">Mic Off</span>
                                    )}
                                </div>
                            </div>

                            {/* AI Voice Visualizer */}
                            <div>
                                <AudioVisualizer
                                    analyserNode={speakerAnalyser}
                                    darkMode={darkMode}
                                    label="AI Interviewer"
                                    color={darkMode ? "#818cf8" : "#6366f1"}
                                    height={80}
                                />
                                <div className="flex items-center justify-center mt-2">
                                    {isSpeaking || isAiSpeaking ? (
                                        <span className="flex items-center text-indigo-500 text-sm">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse" />
                                            Speaking
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 text-sm">Idle</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className={`mt-6 p-4 rounded-xl text-center ${darkMode ? "bg-gray-800" : "bg-gray-100"
                            }`}>
                            {!isActive ? (
                                <p className="text-yellow-500">Ready to start</p>
                            ) : isListening ? (
                                <p className="text-green-500">🎤 Your turn to speak</p>
                            ) : isSpeaking || isAiSpeaking ? (
                                <p className="text-indigo-500">🤖 AI is responding...</p>
                            ) : (
                                <p className="text-blue-500">Processing...</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Transcript */}
                    <div className={`lg:col-span-2 p-6 rounded-2xl ${darkMode ? "bg-[#23272f]" : "bg-white"} shadow-xl flex flex-col`}>
                        <h3 className={`font-semibold mb-4 flex items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                            Live Transcript
                        </h3>

                        <div
                            ref={transcriptRef}
                            className={`flex-1 overflow-y-auto rounded-xl p-4 space-y-3 min-h-[300px] max-h-[400px] ${darkMode ? "bg-[#1a1d24]" : "bg-gray-50"
                                }`}
                        >
                            {transcript.length === 0 ? (
                                <div className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>Transcript will appear here during the interview</p>
                                </div>
                            ) : (
                                transcript.map((entry, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] p-3 rounded-xl ${entry.speaker === 'user'
                                            ? darkMode
                                                ? "bg-green-900/40 text-green-100"
                                                : "bg-green-100 text-green-900"
                                            : darkMode
                                                ? "bg-indigo-900/40 text-indigo-100"
                                                : "bg-indigo-100 text-indigo-900"
                                            }`}>
                                            <p className="text-xs font-semibold mb-1 opacity-70">
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

                {/* Control Buttons */}
                <div className="flex justify-center space-x-4">
                    {!isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStartInterview}
                            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-2 ${darkMode
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                } text-white shadow-lg`}
                        >
                            <MicrophoneIcon className="h-6 w-6" />
                            <span>Start Interview</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEndInterview}
                            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-2 ${darkMode
                                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                                : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                                } text-white shadow-lg`}
                        >
                            <PhoneXMarkIcon className="h-6 w-6" />
                            <span>End Interview</span>
                        </motion.button>
                    )}
                </div>

                {/* End Confirmation Modal */}
                {showEndConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-6 rounded-2xl max-w-md w-full mx-4 ${darkMode ? "bg-[#23272f]" : "bg-white"
                                } shadow-2xl`}
                        >
                            <h3 className="text-xl font-bold mb-3">End Interview?</h3>
                            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                Are you sure you want to end the interview? Your transcript will be saved.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelEndInterview}
                                    className={`flex-1 py-3 rounded-xl font-semibold ${darkMode
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                >
                                    Continue
                                </button>
                                <button
                                    onClick={confirmEndInterview}
                                    className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white"
                                >
                                    End Interview
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
