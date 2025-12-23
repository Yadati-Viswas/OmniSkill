import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { customAlphabet } from 'nanoid';
import Layout from "../Layout";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import { getQuizQuestionsApi } from "../../apis/allApis";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const categories = [
  "HTML", "History", "JavaScript", "Java", "Python", "Math",
  "Physics", "C++", "Linux", "Biology", "Art",
  "Statistics", "Algo & DS", "Movies", "Sports",
   "Philosophy", "General Knowledge", "AI", "Quiz for Kids", "Literature"];
categories.sort();
const difficulties = ["Easy", "Medium", "Hard"];

export default function StartQuizPage() {
  const { darkMode } = useDarkMode();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [quizRefferal, setQuizRefferal] = useState("");
  const [loading, setLoading] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const Navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCategoryClick = (cat) => {
    if(cat === undefined) {
        if(selectedCategory === null || selectedCategory.trim() === "") {
            alert("Please enter or select a valid category");
            return;
        }
        console.log("Selected Category:", selectedCategory);
        setSelectedCategory(selectedCategory);
    }
    else setSelectedCategory(cat);
    setShowPopup(true);
    setSelectedDifficulty("");
  };

  const handleStartQuiz = async () => {
    setShowPopup(false);
    setLoading(true);
    let finalReferral = quizRefferal?.trim();
    if (!finalReferral) {
        finalReferral = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)();
        setQuizRefferal(finalReferral);
        console.log("Generated Referral:", finalReferral);
    }
    const referral = finalReferral;
    console.log("referral used:", referral);
    alert(`Starting ${selectedCategory} quiz (${selectedDifficulty})`);
    const response = await getQuizQuestionsApi(selectedCategory, selectedDifficulty, numberOfQuestions, referral);
    setLoading(false);
    console.log("API Response:", response.data);
    Navigate('/quiz-started', { state: { generatedResponse: response.data } });
  };

  if(loading){
      return (
      <Layout>  
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`flex flex-col items-center space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </motion.section>
      </Layout>
    )}

  return (
    <Layout>
      
        <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`flex flex-col items-center space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}
      >
        <h1 className="text-4xl font-bold mb-4">Choose a Category</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
          {categories.map((cat) => (
            <motion.div
              key={cat}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.97 }}
              className={`cursor-pointer rounded-xl p-6 text-center font-semibold transition
                ${darkMode ? "bg-[#23272f] hover:bg-indigo-900" : "bg-white hover:bg-blue-100"}
                shadow-md`}
              onClick={() => {if (!isAuthenticated) {
                    toast.error("You must be logged in to start a quiz.");
                    Navigate("/login");
                    return;
                  }handleCategoryClick(cat)}} >
              {cat}
            </motion.div>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className={`rounded-xl p-8 w-full max-w-sm
                ${darkMode ? "bg-[#23272f] text-white" : "bg-white text-gray-900"}
                shadow-2xl`} >
              <div className="flex items-center">
                <h2 className="text-xl font-bold px-1 mb-4">Selected Category:</h2>
                <div className="mb-4 font-bold text-xl">{selectedCategory}</div>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium">Enter Number of questions: </label>
                <input type="number" min="5" max="100" defaultValue="5" className={`w-full p-3 rounded-lg border 
                  ${darkMode ? "bg-[#23272f] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} 
                  focus:outline-none focus:ring-2 focus:ring-blue-500`} onChange={(e)=>setNumberOfQuestions(e.target.value)}/>
                <span className={ `${darkMode ? "text-white" : "text-black"} text-sm`}>Max Questions:100, Min Questions:5</span>
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-medium">Choose Difficulty:</label>
                <div className="flex space-x-3">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      className={`px-4 py-2 rounded-full border font-semibold transition
                        ${selectedDifficulty === diff
                          ? darkMode
                            ? "bg-indigo-700 text-white border-indigo-700"
                            : "bg-blue-500 text-white border-blue-500"
                          : darkMode
                            ? "bg-[#23272f] text-indigo-200 border-indigo-700"
                            : "bg-white text-blue-700 border-blue-500"
                        }`}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col mb-6">
              <label className="text-xl font-bold px-1 mb-2">
                Quiz Referral:
              </label>
              <input
                type="text"
                placeholder="Quiz Referral (optional)"
                value={quizRefferal}
                onChange={(e) => setQuizRefferal(e.target.value)}
                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#23272f] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
              <div className="flex justify-end space-x-3">
                <button
                  className={`px-4 py-2 rounded font-semibold ${darkMode ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"}`}
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded font-semibold
                    ${selectedDifficulty
                      ? darkMode
                        ? "bg-indigo-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-400 text-gray-100 cursor-not-allowed"
                    }`}
                  disabled={!selectedDifficulty}
                  onClick={handleStartQuiz}
                >
                  Start Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className={`px-6 py-6 mt-8 ${darkMode ? "bg-[#1f2937] border-t border-gray-700" : "bg-gray-50 border-t border-gray-200"}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} flex-1`}>
            Couldn't find a category you like? Enter a category you want to start.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
            <motion.input
                type="text"
                placeholder="Enter category"
                className={`flex-1 px-4 py-2 rounded-lg min-w-0
                ${darkMode 
                    ? "bg-[#374151] text-white placeholder-gray-400 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                    : "bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
                onChange={(e) => setSelectedCategory(e.target.value)}
            />
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap
                ${darkMode 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } transition-colors`}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("You must be logged in to start a quiz.");
                    Navigate("/login"); // Redirect to login page
                    return;
                  }
                  handleCategoryClick()}} >
                Start Quiz
            </motion.button>
            </div>
        </div>
        </motion.div>
    </Layout>
  );
}