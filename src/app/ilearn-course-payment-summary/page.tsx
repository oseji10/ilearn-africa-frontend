"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCopy } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Register = () => {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    nationality: "",
    city: "",
    phonenumber: "",
    email_address: "",
    preferred_mode_of_communication: "",
    password: "",
    employment_status: "",
    job_title: "",
    name_of_organization: "",
    years_of_experience: "",
    qualification: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("payOnline");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [emailSearchState, setEmailSearchState] = useState(null); // null, 'loading', 'done'
  const [phoneSearchState, setPhoneSearchState] = useState(null); // null, 'loading', 'done'

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

  // Debounced function for real-time validation
  useEffect(() => {
    let timeoutId;
    const checkUserExists = async () => {
      if (!formData.email_address && !formData.phonenumber) return;

      if (formData.email_address) setEmailSearchState("loading");
      if (formData.phonenumber) setPhoneSearchState("loading");

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/check-user`,
          {
            email: formData.email_address,
            phonenumber: formData.phonenumber,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        setEmailError(response.data.email_exists ? "Email already exists." : null);
        setPhoneError(response.data.phonenumber_exists ? "Phone number already exists." : null);
        if (formData.email_address) setEmailSearchState("done");
        if (formData.phonenumber) setPhoneSearchState("done");
      } catch (error) {
        console.error("Error checking user:", error);
        setFormError("Failed to validate email or phone number.");
        if (formData.email_address) setEmailSearchState("done");
        if (formData.phonenumber) setPhoneSearchState("done");
      }
    };

    if (formData.email_address || formData.phonenumber) {
      timeoutId = setTimeout(checkUserExists, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [formData.email_address, formData.phonenumber]);

  // Generate transaction reference when transferNow is selected
  useEffect(() => {
    if (paymentMethod === "transferNow" && course?.course_id) {
      setTransactionRef(`${course.course_id}_${Date.now()}`);
    } else {
      setTransactionRef("");
    }
  }, [paymentMethod, course]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "radio" ? value : value,
    }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setSelectedAmount("");
  };

  const handleAmountChange = (e) => {
    setSelectedAmount(e.target.value);
  };

  const copyTransactionRef = () => {
    if (transactionRef) {
      navigator.clipboard.writeText(transactionRef);
      alert("Transaction reference copied to clipboard!");
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    console.log("handleProceedToPayment called with paymentMethod:", paymentMethod);
    setIsSubmitting(true);
    setFormError("");

    // Validate form fields
    const requiredFields = [
      "full_name",
      "gender",
      "date_of_birth",
      "nationality",
      "city",
      "phonenumber",
      "email_address",
      "preferred_mode_of_communication",
      "password",
      "employment_status",
      "qualification",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        console.log(`Form validation failed: Missing ${field}`);
        setFormError(`Please fill in the ${field.replace("_", " ")} field.`);
        setIsSubmitting(false);
        return;
      }
    }

    // Check for email or phone errors to prevent submission
    if (emailError || phoneError) {
      setFormError("The email or phone number is already in use. Please use a different one.");
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
          tx_ref: transactionRef,
          amount: parseInt(selectedAmount),
          email: formData.email_address,
          course_id: course.course_id,
          cohort_id: course.cohort_id,
          name: formData.full_name,
          phonenumber: formData.phonenumber,
          payment_method: "bank_transfer",
          secret: formData.password,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          nationality: formData.nationality,
          address: formData.city,
          preferred_mode_of_communication: formData.preferred_mode_of_communication,
          employment_status: formData.employment_status,
          job_title: formData.job_title,
          name_of_organization: formData.name_of_organization,
          years_of_experience: formData.years_of_experience,
          qualification: formData.qualification,
        };

        console.log("Sending transfer notification:", payload);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/notify-payment`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Backend response:", response.data);
        if (response.data.success) {
          // Store token and user details for autologin
          localStorage.setItem("token", response.data.access_token);
          localStorage.setItem("client_id", response.data.user.client_id);
          localStorage.setItem("role", response.data.role);
          localStorage.setItem("status", response.data.client.status);

          // Redirect based on role and status
          if (response.data.role === "client" && response.data.client.status === "profile_created") {
            router.push("/clients/register");
          } else {
            router.push("/dashboard");
          }
        } else {
          throw new Error(response.data.message || "Failed to notify payment.");
        }
      } catch (error) {
        console.error("Payment notification error:", error, "Response:", error.response?.data);
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.details
            ? Object.values(error.response.data.details).join(", ")
            : "Failed to notify payment. Please try again.");
        setFormError(errorMessage);
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

      try {
        const payload = {
          tx_ref: `${course.course_id}-${Date.now()}`,
          amount: parseInt(course.amount),
          currency: "NGN",
          redirect_url: `${process.env.NEXT_PUBLIC_API_URL}/verify-this-payment?course_id=${encodeURIComponent(
            course.course_id
          )}&cohort_id=${encodeURIComponent(course.cohort_id)}`,
          payment_options: "card,banktransfer,ussd",
          customer: {
            email: formData.email_address,
            phonenumber: formData.phonenumber,
            name: formData.full_name,
            secret: formData.password,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth,
            nationality: formData.nationality,
            address: formData.city,
            preferred_mode_of_communication: formData.preferred_mode_of_communication,
            employment_status: formData.employment_status,
            job_title: formData.job_title,
            name_of_organization: formData.name_of_organization,
            years_of_experience: formData.years_of_experience,
            qualification: formData.qualification,
          },
          customizations: {
            title: "iLearn Africa Course Payment",
            description: `Payment for ${course.course_name} - ${course.cohort_name}`,
            logo: `${window.location.origin}/images/logo/ilearn-logo.png`,
          },
        };

        console.log(
          "Sending payment request to backend:",
          `${process.env.NEXT_PUBLIC_API_URL}/initialize-payment`,
          "with payload:",
          payload
        );
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/initialize-payment`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Backend response:", response.data);
        if (response.data.data && response.data.data.link) {
          console.log("Redirecting to payment URL:", response.data.data.link);
          sessionStorage.setItem("payment_payload", JSON.stringify(payload));
          window.location.href = response.data.data.link;
        } else {
          console.error("Invalid response structure:", response.data);
          throw new Error("Payment URL not returned in response.");
        }
      } catch (error) {
        console.error("Payment initiation failed:", error, "Response:", error.response?.data);
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.details
            ? Object.values(error.response.data.details).join(", ")
            : "Failed to initiate payment. Please try again.");
        setFormError(errorMessage);
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
            Registration & Payment
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
                <form onSubmit={handleProceedToPayment} className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">🧾 SECTION A: PERSONAL INFORMATION</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Please fill in your details accurately. Your certificate will be issued based on this information.
                    </p>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name (as on certificate)</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Gender</label>
                      <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={formData.gender === "Male"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Male
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Female"
                            checked={formData.gender === "Female"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Female
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Nationality</label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your nationality"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your city"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone Number (WhatsApp preferred)</label>
                      <input
                        type="tel"
                        name="phonenumber"
                        value={formData.phonenumber}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter your phone number"
                      />
                      {phoneSearchState && (
                        <span
                          className={`text-sm mt-1 block ${
                            phoneSearchState === "loading" || phoneError
                              ? "text-red dark:text-red"
                              : "text-green-600 dark:text-green-500"
                          }`}
                        >
                          {phoneSearchState === "loading" ? "Checking..." : phoneError || "Phone number has not been used."}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                      <input
                        type="email"
                        name="email_address"
                        value={formData.email_address}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter your email"
                      />
                      {emailSearchState && (
                        <span
                          className={`text-sm mt-1 block ${
                            emailSearchState === "loading" || emailError
                              ? "text-red dark:text-red"
                              : "text-green-600 dark:text-green-500"
                          }`}
                        >
                          {emailSearchState === "loading" ? "Checking..." : emailError || "Email has not been used."}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Preferred Communication Channel</label>
                      <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="preferred_mode_of_communication"
                            value="Email"
                            checked={formData.preferred_mode_of_communication === "Email"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Email
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="preferred_mode_of_communication"
                            value="WhatsApp"
                            checked={formData.preferred_mode_of_communication === "WhatsApp"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          WhatsApp
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="preferred_mode_of_communication"
                            value="Phone Call"
                            checked={formData.preferred_mode_of_communication === "Phone Call"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Phone Call
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">🏢 SECTION B: PROFESSIONAL DETAILS</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Employment Status</label>
                      <div className="flex flex-wrap items-center space-x-4 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="employment_status"
                            value="Employed"
                            checked={formData.employment_status === "Employed"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Employed
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="employment_status"
                            value="Self-Employed"
                            checked={formData.employment_status === "Self-Employed"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Self-Employed
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="employment_status"
                            value="Unemployed"
                            checked={formData.employment_status === "Unemployed"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Unemployed
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="employment_status"
                            value="Student"
                            checked={formData.employment_status === "Student"}
                            onChange={handleInputChange}
                            required
                            className="mr-2 text-indigo-600 focus:ring-indigo-500"
                          />
                          Student
                        </label>
                      </div>
                    </div>
                    {(formData.employment_status === "Employed" || formData.employment_status === "Self-Employed") && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Job Title</label>
                          <input
                            type="text"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleInputChange}
                            required={formData.employment_status === "Employed" || formData.employment_status === "Self-Employed"}
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Enter your job title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name of Organization</label>
                          <input
                            type="text"
                            name="name_of_organization"
                            value={formData.name_of_organization}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Enter your organization name"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Years of Professional Experience</label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter years of experience"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Educational Qualification</label>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Select qualification</option>
                        <option value="1">SSCE</option>
                        <option value="2">NCE</option>
                        <option value="3">OND</option>
                        <option value="4">HND</option>
                        <option value="5">Degree</option>
                        <option value="6">PGD</option>
                        <option value="7">Masters</option>
                        <option value="8">PhD</option>
                      </select>
                    </div>
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
                          Please include the transaction reference{" "}
                          <strong className="inline-flex items-center">
                            {transactionRef}
                            <button
                              onClick={copyTransactionRef}
                              className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-600"
                              title="Copy Transaction Reference"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </strong>{" "}
                          in your transfer description.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting || !!emailError || !!phoneError}
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
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;