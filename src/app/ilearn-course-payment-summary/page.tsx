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
  const [paymentMethod, setPaymentMethod] = useState("payOnline");
  const [selectedAmount, setSelectedAmount] = useState("");

  // Generate amount options from 5,000 to 300,000 in increments of 5,000
  const amountOptions = Array.from({ length: 60 }, (_, i) => (i + 1) * 5000);

  // Extract query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course_id");
    const cohortId = params.get("cohort_id");
    const courseName = params.get("course_name");
    const cohortName = params.get("cohort_name");
    const cost = params.get("cost");
    const start_date = params.get("start_date");

    if (!courseId || !cohortId || !courseName || !cohortName) {
      console.log("Missing required query parameters:", { courseId, cohortId, courseName, cohortName });
      setIsLoading(false);
      return;
    }

    const courseData = {
      course_id: courseId,
      course_name: decodeURIComponent(courseName),
      cohort_id: cohortId,
      cohort_name: decodeURIComponent(cohortName),
      amount: cost ? cost : "N/A",
      start_date: start_date ? new Date(start_date).toLocaleDateString() : "N/A",
    };
    console.log("Course data set:", courseData);
    setCourse(courseData);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setSelectedAmount("");
  };

  const handleAmountChange = (e) => {
    setSelectedAmount(e.target.value);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    console.log("handleProceedToPayment called with paymentMethod:", paymentMethod);
    setIsSubmitting(true);
    setFormError("");

    // Validate form fields
    if (!formData.name || !formData.email || !formData.phone_number || !formData.password) {
      console.log("Form validation failed: Missing fields");
      setFormError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    if (paymentMethod === "transferNow") {
      if (!selectedAmount) {
        console.log("Transfer validation failed: No amount selected");
        setFormError("Please select an amount for the transfer.");
        setIsSubmitting(false);
        return;
      }

      try {
        const payload = {
          tx_ref: `tx_${Date.now()}`,
          amount: parseInt(selectedAmount),
          email: formData.email,
          course_id: course.course_id,
          cohort_id: course.cohort_id,
          name: formData.name,
          phone_number: formData.phone_number,
          payment_method: "bank_transfer",
        };

        console.log("Sending transfer notification:", payload);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/notify-payment`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          alert("Payment notification submitted successfully. We will verify your payment shortly.");
          router.push("/payment-confirmation");
        } else {
          throw new Error(response.data.message || "Failed to notify payment.");
        }
      } catch (error) {
        console.error("Payment notification error:", error);
        setFormError(error.message || "Failed to notify payment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Entering Pay Online branch with course:", course);
      if (!course) {
        console.log("Validation failed: No course data");
        setFormError("Course information is missing.");
        setIsSubmitting(false);
        return;
      }
      if (course.amount === "N/A") {
        console.log("Validation failed: Invalid course amount");
        setFormError("Course cost information is missing.");
        setIsSubmitting(false);
        return;
      }
      if (!process.env.NEXT_PUBLIC_FLUTTERWAVE_URL) {
        console.log("Validation failed: Missing Flutterwave URL");
        setFormError("Payment configuration error: Missing URL.");
        setIsSubmitting(false);
        return;
      }
      if (!process.env.NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY) {
        console.log("Validation failed: Missing Flutterwave secret key");
        setFormError("Payment configuration error: Missing secret key.");
        setIsSubmitting(false);
        return;
      }

      try {
        const payload = {
          tx_ref: `${course.course_id}-${Date.now()}`,
          amount: parseInt(course.amount),
          currency: "NGN",
          email: formData.email,
          phone_number: formData.phone_number,
          name: formData.name,
          payment_options: "card, banktransfer, ussd",
        redirect_url: `${process.env.NEXT_PUBLIC_API_URL}/verify-this-payment?course_id=${encodeURIComponent(course.course_id)}&cohort_id=${encodeURIComponent(course.cohort_id)}`,
          customizations: {
            title: "iLearn Africa Course Payment",
            description: `Payment for ${course.course_name} - ${course.cohort_name}`,
            logo: `${window.location.origin}/images/logo/ilearn-logo.png`,
          },
        };

        console.log("Sending payment request to:", process.env.NEXT_PUBLIC_FLUTTERWAVE_URL, "with payload:", payload);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/initialize-payment`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY}`,
          },
        });

        console.log("Flutterwave response:", response.data);
        if (response.data.data && response.data.data.link) {
          console.log("Redirecting to payment URL:", response.data.data.link);
          window.location.href = response.data.data.link;
        } else {
          console.error("Invalid response structure:", response.data);
          throw new Error("Payment URL not returned in response.");
        }
      } catch (error) {
        console.error("Payment initiation failed:", error, "Response:", error.response?.data);
        setFormError(error.response?.data?.message || "Failed to initiate payment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
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
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Date</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{course.start_date}</p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Details</h3>
                {formError && (
                  <p className="text-sm text-red-500 dark:text-red-400 mb-4 text-center">{formError}</p>
                )}
                <form
                  onSubmit={(e) => {
                    console.log("Form submitted");
                    handleProceedToPayment(e);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment Method</label>
                    <div className="flex items-center space-x-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="payOnline"
                          checked={paymentMethod === "payOnline"}
                          onChange={handlePaymentMethodChange}
                          className="mr-2 text-indigo-600 focus:ring-indigo-500"
                        />
                        Pay Online
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transferNow"
                          checked={paymentMethod === "transferNow"}
                          onChange={handlePaymentMethodChange}
                          className="mr-2 text-indigo-600 focus:ring-indigo-500"
                        />
                        Transfer Now
                      </label>
                    </div>
                  </div>
                  {paymentMethod === "transferNow" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Select Amount</label>
                        <select
                          value={selectedAmount}
                          onChange={handleAmountChange}
                          required={paymentMethod === "transferNow"}
                          className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="">Select an amount</option>
                          {amountOptions.map((amount) => (
                            <option key={amount} value={amount}>
                              ₦{amount.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Bank Transfer Details</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Bank Name:</strong> United Bank for Africa
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Account Name:</strong> iLearn Africa
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Account Number:</strong> 1025182377
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Please include the transaction reference <strong>{`${course?.course_id}-${Date.now()}`}</strong> in your transfer description.
                        </p>
                      </div>
                    </div>
                  )}
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
                      ) : paymentMethod === "transferNow" ? (
                        "I Have Completed This Payment"
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
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;