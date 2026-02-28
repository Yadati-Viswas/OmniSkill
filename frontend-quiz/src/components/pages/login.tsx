import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Layout from "../Layout";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GoogleButton from 'react-google-button';
import { loginUserApi, postGoogleApi } from "../../apis/allApis";
import { useAuth } from '../../contexts/AuthContext';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { LoginCredentials, User } from "../../types";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginCredentials>({
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
                id: (response.data as unknown as { id?: string | number }).id,
                username: response.data.username,
                email: response.data.email
            };
            login(userData, response.data.token);
            navigate('/dashboard');
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

            if (response.status === 200 && response.data && response.data.user) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                const userData: User = {
                    id: response.data.user.id,
                    username: response.data.user.username,
                    email: response.data.user.email
                };
                login(userData, response.data.token);
                navigate("/dashboard");
            } else {
                alert(`Login failed. Status: ${response.status}.`);
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
                className="surface-card mx-auto w-full max-w-2xl rounded-2xl p-6 sm:p-8"
            >
                <h1 className="page-title mb-5">Login Account</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="form-label mb-2 block">Username or Email</label>
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
                            className="px-3 py-3"
                            placeholder="username or you@example.com"
                            type="text"
                            aria-required="true"
                        />
                        {errors.identifier && <p className="mt-2 text-sm text-[var(--omni-danger)]">{errors.identifier.message}</p>}
                    </div>

                    <div>
                        <label className="form-label mb-2 block">Password</label>
                        <input
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Minimum 6 characters" },
                            })}
                            className="px-3 py-3"
                            placeholder="Password"
                            type="password"
                            aria-required="true"
                        />
                        {errors.password && <p className="mt-2 text-sm text-[var(--omni-danger)]">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full rounded-lg px-6 py-3"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center">
                    <p className="mb-3 text-sm text-[var(--omni-text-muted)]">or login with</p>
                    <GoogleButton>
                        <GoogleOAuthProvider clientId="">
                            <GoogleLogin onSuccess={handleGoogleLogin} onError={handleGoogleError} />
                        </GoogleOAuthProvider>
                    </GoogleButton>
                </div>
            </motion.section>
        </Layout>
    );
};

export default LoginPage;
