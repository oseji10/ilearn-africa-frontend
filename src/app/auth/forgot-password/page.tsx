"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const SignIn: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(100);
  const [success, setSuccess] = useState("");
  const [login, setEmail] = useState("");
 
  const handleForgotPassword = async (event) => {
    event.preventDefault();
  
    
  
    setIsSubmitting(true);
  
    const formData = new FormData(event.target);
    const data = {
      login: formData.get("login"),
    };
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
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
        setError(errorResult.message || "Something went wrong.");
        return;
      }
  
      const result = await response.json();
      setSuccess(result.message || "Password reset link sent successfully!");
  
  
    } catch (error) {
      setError("Network error: " + error.message);
    }
  
    setIsSubmitting(false);
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
          {/* // <div className="fixed top-4 right-4 flex items-start bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 w-80"> */}
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
          {/* <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            Forgot
          </p> */}
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
            Enter Your Email or Phone Number To Request A Password Reset
          </h2>
          <form onSubmit={handleForgotPassword}>
            <div className="relative mb-4">
              <input
                required
                type="text"
                name="login"
                placeholder="Email or Phone Number"
                value={login}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} />
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
                  <>
                  Please wait...<FontAwesomeIcon icon={faSpinner} spin />
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Have your password? &nbsp;
              <a className="text-primary hover:underline" href="/auth/signin">
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

