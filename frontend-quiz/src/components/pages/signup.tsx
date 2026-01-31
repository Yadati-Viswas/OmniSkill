import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Layout from "../Layout";
import { motion } from "framer-motion";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import { singupUserApi } from "../../apis/allApis";
import { useNavigate } from "react-router-dom";
import { SignupData } from "../../types";

const SignupPage: React.FC = () => {
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupData>({
        defaultValues: {
            lastName: "",
            firstName: "",
            username: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit: SubmitHandler<SignupData> = async (data) => {
        console.log("Signup data:", data);
        const response = await singupUserApi(data);
        console.log("Signup API response:", response);
        if (response.status === 201) {
            navigate("/login");
            alert("Signup submitted (check console)");
        } else {
            alert("Signup failed: Unknown error");
        }
    };

    const password = watch("password", "");

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`max-w-3xl mx-auto p-6 rounded-lg ${darkMode ? "bg-[#23272f] text-white" : "bg-white text-gray-900"} shadow`}
            >
                <h1 className="text-3xl font-bold mb-4">Create Account</h1>
                <p className={`mb-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Fields marked with <span className="text-red-600">*</span> are required.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">First name</label>
                            <input
                                {...register("firstName")}
                                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                placeholder="First name"
                                type="text"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Last name</label>
                            <input
                                {...register("lastName")}
                                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                placeholder="Last name"
                                type="text"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Username <span className="text-red-600">*</span>
                        </label>
                        <input
                            {...register("username", { required: "Username is required", minLength: { value: 3, message: "Minimum 3 chars" } })}
                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                            placeholder="Username"
                            aria-required="true"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Email <span className="text-red-600">*</span>
                        </label>
                        <input
                            {...register("email", {
                                required: "Email is required",
                                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                            })}
                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                            placeholder="you@example.com"
                            type="email"
                            aria-required="true"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Phone</label>
                        <input
                            {...register("phone")}
                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                            placeholder="Optional phone number"
                            type="tel"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">
                                Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Minimum 6 characters" },
                                })}
                                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                placeholder="Password"
                                type="password"
                                aria-required="true"
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                Confirm password <span className="text-red-600">*</span>
                            </label>
                            <input
                                {...register("confirmPassword", {
                                    required: "Please confirm password",
                                    validate: (value) => value === password || "Passwords do not match",
                                })}
                                className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                placeholder="Confirm password"
                                type="password"
                                aria-required="true"
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-lg font-semibold ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} transition`}
                        >
                            {isSubmitting ? "Submitting..." : "Create account"}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.section>
        </Layout>
    );
}

export default SignupPage;
