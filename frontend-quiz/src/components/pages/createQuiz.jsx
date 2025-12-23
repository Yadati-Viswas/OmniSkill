import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { customAlphabet } from 'nanoid';
import Layout from "../Layout";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createQuizApi } from "../../apis/allApis";

export default function CreateQuizPage() {
  const { darkMode } = useDarkMode();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizRefferal, setQuizRefferal] = useState("");
  const [questions, setQuestions] = useState([
    { question: "",code:"", options: ["", "", "", ""], explanation:"", correctIndex: null }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewed, setPreviewed] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "",code:"", options: ["", "", "", ""], explanation:"", correctIndex: null }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === "question") {
      updatedQuestions[index].question = value;
    } else if (field === "code") {
      updatedQuestions[index].code = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.split("-")[1], 10);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === "explanation") {
      updatedQuestions[index].explanation = value;
    } else if (field === "correctIndex") {
      updatedQuestions[index].correctIndex = parseInt(value, 10);
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async() => {
    if(!previewed) {
      toast.error("Please preview the quiz before submitting.");
      return;
    }

    try {
      let finalReferral = quizRefferal?.trim();

      if (!finalReferral) {
        finalReferral = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)();
        setQuizRefferal(finalReferral);
        console.log("Generated Referral:", quizRefferal);
      }
      const quizData = {
        title: quizTitle,
        referral: quizRefferal,
        questions: questions.map(q => ({
          question: q.question,
          code: q.code,
          explanation: q.explanation,
          options: q.options,
          correctIndex: q.correctIndex
        }))
      };

      console.log("Quiz Data:", quizData);
      
      const response = await createQuizApi(quizData);
      
      if(response.status === 200) {
        toast.success("Quiz created successfully!");
        setQuizTitle("");
        setQuizRefferal("");
        setQuestions([
          { question: "", code: "", options: ["", "", "", ""], explanation: "", correctIndex: null }
        ]);
        setPreviewed(false);
        setShowPreview(false);
      } else {
        toast.error("Failed to create quiz: " + (response.data?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("An error occurred while creating the quiz. Please try again.");
    }
  };
  const handlePreview = () => {
    if(quizTitle.trim() === "") {
      alert("Please enter quiz Title.");
      return;
    }
    if(questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.question.trim() === "") {
        alert(`Please enter question ${i + 1}.`);
        return;
      }
      if (q.options.some(opt => opt.trim() === "")) {
        alert(`Please fill all options for question ${i + 1}.`);
        return;
      }
      if (q.correctIndex === null || isNaN(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
        alert(`Please select a correct answer for question ${i + 1}.`);
        return;
      }
      if (q.explanation.trim() === "") {
        alert(`Please provide an explanation for question ${i + 1}.`);
        return;
      }
    }
    setShowPreview(true);
    setPreviewed(true);
  };

  return (
    <Layout>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`flex flex-col items-center space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}
      >
        <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-4">Create a New Quiz</h1>
        <div className={`mb-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          <div className={`p-3 rounded ${darkMode ? "bg-[#1f2937] border border-gray-600" : "bg-gray-50 border border-gray-200"}`}>
            <strong className={`${darkMode ? "text-yellow-300" : "text-red-600"} mr-2`}>Note:</strong>
            Quiz Title, Question, Options, Choosing answer and Explanation are required fields.
            <div className="mt-1 text-xs">Required fields are validated on Preview/Submit — please fill them before continuing.</div>
          </div>
        </div>
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2 mb-6">
              <label className="block text-sm mb-1">
                Quiz Title
                <span className="text-red-600 ml-1" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                placeholder="Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                aria-required="true"
                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#23272f] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="w-full md:w-1/2 mb-6">
              <label className="block text-sm mb-1">
                Quiz Referral
              </label>
              <input
                type="text"
                placeholder="Quiz Referral (optional)"
                value={quizRefferal}
                onChange={(e) => setQuizRefferal(e.target.value)}
                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#23272f] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          {questions.map((q, idx) => (
            <div key={idx} className={`mb-8 p-6 rounded-lg border ${darkMode ? "bg-[#23272f] border-gray-600" : "bg-white border-gray-300"}`}>
              <div className="flex items-center mb-4">
                <label className="text-md font-semibold mr-4">
                  Question {idx + 1}
                  <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <textarea rows={2}
                  type="text"
                  placeholder={`Question ${idx + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                  aria-required="true"
                  className={`w-80 p-2 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-black"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <h3 className="text-lg text-left font-semibold mb-2">{`Enter Code for ${idx + 1}:`}</h3>  
              <textarea
                placeholder={`Code snippet (optional)`}
                value={q.code}
                onChange={(e) => handleQuestionChange(idx, "code", e.target.value)}
                className={`w-full p-3 mb-4 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-black"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows={4}
              />
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center mb-3">
                  <input
                    type="text"
                    placeholder={`Option ${optIdx + 1}`}
                    value={opt}
                    onChange={(e) => handleQuestionChange(idx, `option-${optIdx}`, e.target.value)}
                    className={`flex-1 p-2 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-black"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <span className="text-red-600" aria-hidden="true">*</span>
                  <label className="ml-4 flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      value={optIdx}
                      checked={q.correctIndex === optIdx}
                      onChange={(e) => handleQuestionChange(idx, "correctIndex", e.target.value)}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span>Choose answer
                      <span className="text-red-600" aria-hidden="true">*</span>
                    </span>
                  </label>
                </div>
              ))}
              <div className="flex items-center mb-4">
                <label className="text-md font-semibold mr-4">
                  Explanation for Q{idx + 1}:
                  <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <textarea rows={3}
                  placeholder={`Explanation for Q${idx + 1}`}
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(idx, "explanation", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-black"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between space-x-4">
            <button
              onClick={handleAddQuestion}
              className={`hover:cursor-pointer px-6 py-3 rounded-lg font-semibold ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} transition`}
            >
              Add Question
            </button>
            <button
              onClick={handlePreview}
              className={`hover:cursor-pointer px-6 py-3 rounded-lg font-semibold ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} transition`}
            >
              Preview Quiz
            </button>
            <button
              onClick={handleSubmit}
              className={`hover:cursor-pointer px-6 py-3 rounded-lg font-semibold ${darkMode ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"} transition`}
            >
              Submit Quiz
            </button>
          </div>
        </div>
        </div>
      </motion.section>

        <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`${darkMode ? "bg-[#23272f] text-white" : "bg-white text-gray-900"} p-6 rounded-lg max-w-3xl w-full max-h-full overflow-y-auto`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "bg-[#23272f] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}>Quiz Preview: {quizTitle}</h2>
              {questions.map((q, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="font-semibold mb-2">{`Q${idx + 1}: ${q.question}`}</h3>
                  {q.code && q.code.toString().trim() !== "" && (
                    <div className="mb-4">
                      <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                        {q.code.toString()}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  <ul className ="list-disc list-inside">
                    {q.options.map((opt, optIdx) => (
                      <li key={optIdx} className={q.correctIndex === optIdx ? "font-bold text-green-600" : ""}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <h4 className="mt-2 italic">Explanation: {q.explanation || "No explanation provided."}</h4>
                </div>
              ))}
              <button
                onClick={() => setShowPreview(false)}
                className={`mt-4 px-6 py-3 rounded-lg font-semibold ${darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"} transition`}
              >
                Close Preview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}