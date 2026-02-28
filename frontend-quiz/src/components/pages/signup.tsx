import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Layout from "../Layout";
import { motion } from "framer-motion";
import { singupUserApi } from "../../apis/allApis";
import { useNavigate } from "react-router-dom";
import { SignupData } from "../../types";

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<SignupData>({
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
        const response = await singupUserApi(data);
        if (response.status === 201 || response.status === 200) {
            navigate("/login");
            alert("Signup submitted");
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
                className="surface-card mx-auto w-full max-w-3xl rounded-2xl p-6 sm:p-8"
            >
                <h1 className="page-title mb-4">Create Account</h1>
                <p className="mb-5 text-sm text-[var(--omni-text-muted)]">
                    Fields marked with <span className="text-[var(--omni-danger)]">*</span> are required.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="form-label mb-2 block">First name</label>
                            <input
                                {...register("firstName")}
                                className="px-3 py-3"
                                placeholder="First name"
                                type="text"
                            />
                        </div>

                        <div>
                            <label className="form-label mb-2 block">Last name</label>
                            <input
                                {...register("lastName")}
                                className="px-3 py-3"
                                placeholder="Last name"
                                type="text"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label mb-2 block">
                            Username <span className="text-[var(--omni-danger)]">*</span>
                        </label>
                        <input
                            {...register("username", {
                                required: "Username is required",
                                minLength: { value: 3, message: "Minimum 3 chars" }
                            })}
                            className="px-3 py-3"
                            placeholder="Username"
                            aria-required="true"
                        />
                        {errors.username && <p className="mt-1 text-sm text-[var(--omni-danger)]">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="form-label mb-2 block">
                            Email <span className="text-[var(--omni-danger)]">*</span>
                        </label>
                        <input
                            {...register("email", {
                                required: "Email is required",
                                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                            })}
                            className="px-3 py-3"
                            placeholder="you@example.com"
                            type="email"
                            aria-required="true"
                        />
                        {errors.email && <p className="mt-1 text-sm text-[var(--omni-danger)]">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="form-label mb-2 block">Phone</label>
                        <input
                            {...register("phone")}
                            className="px-3 py-3"
                            placeholder="Optional phone number"
                            type="tel"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="form-label mb-2 block">
                                Password <span className="text-[var(--omni-danger)]">*</span>
                            </label>
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
                            {errors.password && <p className="mt-1 text-sm text-[var(--omni-danger)]">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="form-label mb-2 block">
                                Confirm password <span className="text-[var(--omni-danger)]">*</span>
                            </label>
                            <input
                                {...register("confirmPassword", {
                                    required: "Please confirm password",
                                    validate: (value) => value === password || "Passwords do not match",
                                })}
                                className="px-3 py-3"
                                placeholder="Confirm password"
                                type="password"
                                aria-required="true"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-[var(--omni-danger)]">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                        <button type="submit" disabled={isSubmitting} className="btn-primary rounded-lg px-6 py-3">
                            {isSubmitting ? "Submitting..." : "Create account"}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="btn-secondary rounded-lg px-4 py-2 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.section>
        </Layout>
    );
};

export default SignupPage;
