"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Register: React.FC = () => {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course_id");
    const cohortId = params.get("cohort_id");
    const courseName = params.get("course_name");
    const cohortName = params.get("cohort_name");
    const cost = params.get("amount"); // Fixed: Use 'amount' to match SignIn page

    if (!courseId || !cohortId || !courseName || !cohortName) {
      setIsLoading(false);
      return;
    }

    setCourse({
      course_id: courseId,
      course_name: decodeURIComponent(courseName),
      cohort_id: cohortId,
      cohort_name: decodeURIComponent(cohortName),
      amount: cost ? cost : "N/A",
    });
    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError("");

      // Validate amount
      if (!course || course.amount === "N/A") {
        throw new Error("Course cost information is missing.");
      }

      const txRef = `tx_${Date.now()}`;
  
      const payload = {
        tx_ref: txRef,
        amount: 1000, // Fixed: Use a fixed amount for testing
        currency: "NGN",
        // amount: parseInt(course.amount), // Fixed: Use course.amount
        email: formData.email,
        redirect_url: `${process.env.NEXT_PUBLIC_API_URL}/verify-payment`
      };
  
      // Call the backend API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/initialize-payment`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log("Payment initialization response:", response);
  
      if (response.data.data.link) {
        window.location.href = response.data.data.link;
      } else {
        console.error("Error: Payment URL not returned in response", response.data);
        throw new Error("Payment URL not returned");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with an error:", error.response);
        alert(`Error from server: ${error.response.data.message || "Unknown error"}`);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
        alert("No response received from the server. Please check your network.");
      } else {
        console.error("Unexpected error:", error.message);
        alert(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black p-4">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <a href="/" className="mb-8">
          <Image
            className="hidden dark:block"
            src="/images/logo/iLearn-Africa.png"
            alt="iLearn Africa Logo"
            width={200}
            height={40}
          />
          <Image
            className="block dark:hidden"
            src="/images/logo/ilearn-logo.png"
            alt="iLearn Africa Logo"
            width={200}
            height={40}
          />
        </a>
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Payment Summary
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : course ? (
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Course Name</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{course.course_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cohort</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{course.cohort_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cost</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">
                      {course.amount !== "N/A" ? `₦${parseInt(course.amount).toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Details</h3>
                {formError && (
                  <p className="text-sm text-red-500 dark:text-red-400 mb-4 text-center">{formError}</p>
                )}
                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-indigo-600 text-white py-3 px-6 text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          Processing...
                          <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />
                        </>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Missing course or cohort information.
            </p>
          )}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?
            <Link href="/auth/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;