"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faKey,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Use useSearchParams to get the query parameters

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(100);
  const [success, setSuccess] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (password !== password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const data = { token, email, password, password_confirmation }; // Include token and email in the request

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        mode: "cors",
      });

      if (!response.ok) {
        const errorResult = await response.json();
        setError(errorResult.message || "Network response was not ok");
        return;
      }

      const result = await response.json();
      setSuccess(result.message || "Password reset successful!");

      router.push("/");

    } catch (error) {
      console.error("Password reset failed", error);
      setError("An error occurred: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const duration = 5000; // Duration in milliseconds
      const interval = 100; // Update interval in milliseconds
      const steps = duration / interval;
      let currentStep = 0;

      setProgress(100);

      const timer = setInterval(() => {
        currentStep++;
        setProgress((100 * (steps - currentStep)) / steps);

        if (currentStep >= steps) {
          clearInterval(timer);
          setError(""); // Hide the error after duration
          setSuccess(""); // Hide the success after duration
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [error, success]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {/* Success Popup */}
      {success && (
        <div className="fixed top-4 right-4 flex items-start bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 w-80">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faUser} size="2x" />
          </div>
          <div className="ml-3">
            <h5 className="text-lg font-semibold">Success</h5>
            <p>{success}</p>
            <div className="mt-2 w-full bg-green-700 h-1">
              <div
                className="bg-green-900 h-1"
                style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && (
        <div className="fixed top-4 right-4 flex items-start rounded-lg z-50 w-80" style={{background:'red', color:'white'}}>
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faUser} size="2x" />
          </div>
          <div className="ml-3">
            <h5 className="text-lg font-semibold">Error</h5>
            <p>{error}</p>
            <div className="mt-2 w-full  h-1" style={{background:'red'}}>
              <div
                className=" h-1"
                style={{color:'red', width: `${progress}%`, transition: "width 0.1s linear" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row">
        {/* Left Side - Logo and Description */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-4">
          <a href="/">
            <Image
              className="hidden dark:block"
              src="/images/logo/iLearn-Africa.png"
              alt="Logo"
              width={150}
              height={30}
            />
            <Image
              className="block dark:hidden"
              src="/images/logo/ilearn-logo.png"
              alt="Logo"
              width={150}
              height={30}
            />
          </a>
          <h2 className="mt-4 text-2xl font-bold text-center text-black dark:text-white">
            Welcome Back to iLearn Africa Office Management System
          </h2>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
            Change Your Password
          </h2>
          <form onSubmit={handleResetPassword}>
            <div className="relative mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <FontAwesomeIcon icon={faKey} />
              </span>
            </div>

            <div className="relative mb-4">
              <input
                type="password"
                value={password_confirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <FontAwesomeIcon icon={faKey} />
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center rounded-lg bg-primary text-white py-2 hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t have an account? &nbsp;
              <a className="text-primary hover:text-primary-dark" href="/auth/signup">
                Sign Up Now
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
