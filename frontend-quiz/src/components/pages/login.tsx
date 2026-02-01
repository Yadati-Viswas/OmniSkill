import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Layout from "../Layout";
import { motion } from "framer-motion";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import { useNavigate } from "react-router-dom";
import GoogleButton from 'react-google-button';
import { loginUserApi, postGoogleApi } from "../../apis/allApis";
import { useAuth } from '../../contexts/AuthContext';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { LoginCredentials, User } from "../../types";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const handleGoogleLogin = async (credentialResponse: CredentialResponse): Promise<void> => {
        if (!credentialResponse.credential) return;
        const response = await postGoogleApi(credentialResponse.credential);
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            const tokenExpiration = Date.now() + 60 * 60 * 1000;
            localStorage.setItem('tokenExpiration', String(tokenExpiration));
            const userData: User = {
                username: response.data.username,
                email: response.data.email
            };
            login(userData, response.data.token);
            navigate('/');
        } else {
            alert("Login failed");
        }
    };

    const handleGoogleError = (): void => {
        alert('Google Sign In was unsuccessful. Try again later');
    };

    const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
        try {
            const response = await loginUserApi(data);
            console.log("DEBUG: Full Response Data:", JSON.stringify(response.data, null, 2));
            console.log("DEBUG: Keys in Data:", Object.keys(response.data || {}));

            if (response.status === 200 && response.data && response.data.user) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                const userData: User = {
                    username: response.data.user.username,
                    email: response.data.user.email
                };
                login(userData, response.data.token);
                navigate("/");
            } else {
                alert(`Login failed. Status: ${response.status}. Data keys: ${Object.keys(response.data || {}).join(", ")}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed: Unknown error (check console)");
        }
    };

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`max-w-6xl px-20 py-6 rounded-lg ${darkMode ? "bg-[#23272f] text-white" : "bg-white text-gray-900"} shadow-lg`}
            >
                <h1 className="text-3xl font-bold mb-3">Login Account</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3 ">
                            Username or Email
                        </label>
                        <input
                            {...register("identifier", {
                                required: "Username or email is required",
                                validate: (value) => {
                                    const emailRegex = /^\S+@\S+\.\S+$/;
                                    if (!value || value.trim() === "") return "Username or email is required";
                                    if (emailRegex.test(value)) return true;
                                    if (value.trim().length >= 3) return true;
                                    return "Enter a valid email or username (min 3 chars)";
                                },
                            })}
                            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-[#374151] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                            placeholder="username or you@example.com"
                            type="text"
                            aria-required="true"
                        />
                        {errors.identifier && <p className="text-red-500 text-sm mt-2">{errors.identifier.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Password
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
                        {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full px-6 py-3 rounded-lg font-semibold ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} transition disabled:bg-gray-400`}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
                <div className="mt-4 flex flex-col items-center">
                    <p className="mb-2">or login with</p>
                    <GoogleButton >
                        <GoogleOAuthProvider clientId="">
                            <GoogleLogin onSuccess={handleGoogleLogin} onError={handleGoogleError} />
                        </GoogleOAuthProvider>
                    </GoogleButton>
                </div>
            </motion.section>
        </Layout>
    );
}

export default LoginPage;
