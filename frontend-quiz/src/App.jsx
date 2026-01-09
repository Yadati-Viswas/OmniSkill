import React from "react";
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from "./HomePage";
import StartQuizPage from "./components/pages/startQuiz";
import CreateQuizPage from "./components/pages/createQuiz";
import QuizStartedPage from "./components/pages/quizStarted";
import SignupPage from "./components/pages/signup";
import LoginPage from "./components/pages/login";
import OmniQuizPage from "./components/pages/omniQuiz";
import JoinQuizPage from "./components/pages/joinQuiz";
import ProtectedRoute from "./components/ProtectedRoute";
import ProblemsPage from "./components/pages/problemsPage";
import SolveProblemPage from "./components/pages/solveProblemPage";
import { DarkModeContextProvider } from "./contexts/DarkModeContextProvider";
import { AuthProvider } from "./contexts/AuthContext";
import {ToastContainer, toast} from "react-toastify";
// import CreateQuizPage from "./CreateQuizPage";

export default function App() {
  return (
    <div>
      <AuthProvider>
        <DarkModeContextProvider>
          <Router>
            <Routes>
              <Route path="/"  element={<HomePage/>} />
              <Route path="/start-quiz" element={<StartQuizPage/>} />
              <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizPage/></ProtectedRoute>} />
              <Route path="/quiz-started" element= {<QuizStartedPage/>}/>
              <Route path="/signup" element={<SignupPage/>} />
              <Route path="/login" element={<LoginPage/>} />
              <Route path="/omni-quiz" element={<OmniQuizPage/>} />
              <Route path="/join-quiz" element={<JoinQuizPage/>} />
              <Route path="/problems" element={<ProblemsPage/>} />
              <Route path="/problems/:id" element={<SolveProblemPage/>} />
              {/*<Route path="*" component={NotFoundPage} /> */}
            </Routes>
          </Router>
        </DarkModeContextProvider>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </AuthProvider>
    </div>
  );
}