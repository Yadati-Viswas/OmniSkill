import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from "./HomePage";
import StartQuizPage from "./components/pages/startQuiz";
import CreateQuizPage from "./components/pages/createQuiz";
import QuizStartedPage from "./components/pages/quizStarted";
import SignupPage from "./components/pages/signup";
import LoginPage from "./components/pages/login";
import OmniQuizPage from "./components/pages/omniQuiz";
import DashboardPage from "./components/pages/dashboard";
import JoinQuizPage from "./components/pages/joinQuiz";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ProblemsPage from "./components/pages/problemsPage";
import SolveProblemPage from "./components/pages/solveProblemPage";
import StartInterviewPage from "./components/pages/startInterview";
import InterviewSessionPage from "./components/pages/interviewSession";
import InterviewFeedbackPage from "./components/pages/interviewFeedback";
import ComingSoonPage from "./components/pages/comingSoon";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/start-quiz" element={<StartQuizPage />} />
            <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
            <Route path="/quiz-started" element={<QuizStartedPage />} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/omni-quiz" element={<OmniQuizPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/join-quiz" element={<JoinQuizPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:id" element={<SolveProblemPage />} />
            <Route path="/start-interview" element={<StartInterviewPage />} />
            <Route path="/interview-session" element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>} />
            <Route path="/interview-feedback" element={<ProtectedRoute><InterviewFeedbackPage /></ProtectedRoute>} />
            <Route path="/start-courses" element={<ComingSoonPage />} />
            <Route path="/enroll-course" element={<ComingSoonPage />} />
            <Route path="/blogs" element={<ComingSoonPage />} />
            <Route path="/resources" element={<ComingSoonPage />} />
            <Route path="/skills-report" element={<ComingSoonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </AuthProvider>
    );
};

export default App;
