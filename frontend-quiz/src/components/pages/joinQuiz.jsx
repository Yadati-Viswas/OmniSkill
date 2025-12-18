import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import Layout from "../Layout";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { joinQuizApi } from "../../apis/allApis";
import "react-toastify/dist/ReactToastify.css";

export default function JoinQuizPage() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlerefferalCode = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("You must be logged in to join a quiz.");
      navigate("/login"); 
      return;
    }

    const referralCode = e.target.referralCode.value.trim();
    if (referralCode === "") {
      toast.error("Please enter a valid referral code.");
      return;
    }

    try {
      const response = await joinQuizApi(referralCode);
      console.log("Join Quiz API Response:", response.data);
      toast.success("Successfully joined the quiz!");
      navigate("/quiz-started", { state: { allQuestions: response.data } });
    } catch (error) {
      console.error("Error joining quiz:", error);
      toast.error("Failed to join the quiz. Please check the referral code and try again.");
    }
  };

  return (
    <Layout>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`flex flex-col items-center space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}
      >
        <h1 className="text-4xl font-bold mb-4">Join Quiz through a Referral</h1>
        <div className="w-full max-w-4xl">
          <form className="flex flex-col space-y-6" onSubmit={handlerefferalCode}>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="referralCode">
                Referral Code
              </label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? "bg-[#2c2f36] text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
                }`}
                placeholder="Enter referral code"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:cursor-pointer"
            >
              Join Quiz
            </button>
          </form>
        </div>
      </motion.section>
    </Layout>
  );
}