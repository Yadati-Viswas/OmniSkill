import React, { FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { joinQuizApi } from "../../apis/allApis";
import "react-toastify/dist/ReactToastify.css";

const JoinQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handlerefferalCode = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("You must be logged in to join a quiz.");
            navigate("/login");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const referralCode = (formData.get("referralCode") as string || "").trim();

        if (referralCode === "") {
            toast.error("Please enter a valid referral code.");
            return;
        }

        try {
            const response = await joinQuizApi(referralCode);
            toast.success("Successfully joined the quiz!");
            navigate("/quiz-started", { state: { generatedResponse: response.data } });
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
                className="mx-auto w-full max-w-2xl"
            >
                <div className="surface-card rounded-2xl p-6 sm:p-8">
                    <h1 className="page-title mb-4">Join Quiz with Referral</h1>
                    <p className="page-subtitle mb-6">Enter your referral code to jump directly into a shared quiz.</p>

                    <form className="flex flex-col gap-5" onSubmit={handlerefferalCode}>
                        <div>
                            <label className="form-label mb-2 block" htmlFor="referralCode">
                                Referral Code
                            </label>
                            <input
                                type="text"
                                id="referralCode"
                                name="referralCode"
                                className="px-4 py-3"
                                placeholder="Enter referral code"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary rounded-lg px-6 py-3">
                            Join Quiz
                        </button>
                    </form>
                </div>
            </motion.section>
        </Layout>
    );
};

export default JoinQuizPage;
