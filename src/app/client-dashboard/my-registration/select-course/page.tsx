"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCopy } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const RegistrationPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [client_id, setClientId] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('payOnline');
  const [selectedAmount, setSelectedAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [consentIP, setConsentIP] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate amount options from 5,000 to 300,000 in increments of 5,000
  const amountOptions = Array.from({ length: 60 }, (_, i) => (i + 1) * 5000);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      
      try {
        // Fetch client status
        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/client-id`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!statusResponse.ok) throw new Error("Failed to fetch client status");
        const statusData = await statusResponse.json();
        setStatus(statusData.status);
        setEmail(statusData.email);
        setName(
        `${statusData.firstname || ''} ${statusData.lastname || ''}`.trim() || "Unknown User"
        );
        setPhoneNumber(statusData.phone_number);
        setClientId(statusData.client_id);
        // Fetch available courses
        const coursesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/active`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!coursesResponse.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesResponse.json();
        
        // Filter and format courses data
        const activeCourses = coursesData.cohorts
          .filter((item) => item.cohorts.status === "active")
          .map((item) => ({
            course_id: item.course_id,
            course_name: item.course_list?.course_name || "Unknown Course",
            cohort_id: item.cohort_id,
            cohort_name: item.cohorts.cohort_name,
            start_date: item.cohorts.start_date,
            cost: item.course_list?.cost || "N/A",
          }));
        
        setCourses(activeCourses);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate transaction reference when transferNow or alreadyPaid is selected
  useEffect(() => {
    if ((paymentMethod === "transferNow" || paymentMethod === "alreadyPaid") && selectedCourse?.course_id) {
      setTransactionRef(`${selectedCourse.course_id}_${Date.now()}`);
    } else {
      setTransactionRef("");
    }
  }, [paymentMethod, selectedCourse]);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setPaymentMethod('payOnline');
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setSelectedAmount("");
    setPaymentProof(null);
    setPreviewUrl(null);
    setError("");
  };

  const handleAmountChange = (e) => {
    setSelectedAmount(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        setError("Please upload a valid file (JPEG, PNG, or PDF).");
        setPaymentProof(null);
        setPreviewUrl(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        setPaymentProof(null);
        setPreviewUrl(null);
        return;
      }
      setPaymentProof(file);
      setError("");
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setPaymentProof(null);
      setPreviewUrl(null);
    }
  };

  const copyTransactionRef = () => {
    if (transactionRef) {
      navigator.clipboard.writeText(transactionRef);
      alert("Transaction reference copied to clipboard!");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!consentIP || !consentSharing) {
      setError("You must agree to all terms and conditions.");
      setIsSubmitting(false);
      return;
    }

    if (paymentMethod === "transferNow") {
      if (!selectedAmount) {
        setError("Please select an amount for the transfer.");
        setIsSubmitting(false);
        return;
      }

      try {
        const payload = {
          tx_ref: transactionRef,
          amount: parseInt(selectedAmount),
          course_id: selectedCourse.course_id,
          cohort_id: selectedCourse.cohort_id,
          payment_method: "bank_transfer",
          email: email,
          name: name,
          phonenumber: phonenumber,
          client_id: client_id,
        };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/notify-payment2`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          router.push("/dashboard");
        } else {
          throw new Error(response.data.message || "Failed to notify payment.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.details
            ? Object.values(error.response.data.details).join(", ")
            : "Failed to notify payment. Please try again.");
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else if (paymentMethod === "alreadyPaid") {
      if (!selectedAmount) {
        setError("Please select an amount for the payment.");
        setIsSubmitting(false);
        return;
      }
      if (!paymentProof) {
        setError("Please upload proof of payment.");
        setIsSubmitting(false);
        return;
      }

      try {
        const formDataPayload = new FormData();
        formDataPayload.append("tx_ref", transactionRef);
        formDataPayload.append("amount", parseInt(selectedAmount));
        formDataPayload.append("course_id", selectedCourse.course_id);
        formDataPayload.append("cohort_id", selectedCourse.cohort_id);
        formDataPayload.append("payment_method", "already_paid");
        formDataPayload.append("payment_proof", paymentProof);

        formDataPayload.append("email", email);
        formDataPayload.append("name", name);
        formDataPayload.append("phonenumber", phonenumber);
        formDataPayload.append("client_id", client_id);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/notify-payment2`,
          formDataPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          router.push("/dashboard");
        } else {
          throw new Error(response.data.message || "Failed to notify payment.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.details
            ? Object.values(error.response.data.details).join(", ")
            : "Failed to notify payment. Please try again.");
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Pay Online method
      if (!selectedCourse) {
        setError("Course information is missing.");
        setIsSubmitting(false);
        return;
      }
      if (selectedCourse.cost === "N/A") {
        setError("Course cost information is missing.");
        setIsSubmitting(false);
        return;
      }

      try {
        const payload = {
          customer: {
            email: email,
            name: name,
            phonenumber: phonenumber,
            client_id: client_id,
          },
          tx_ref: `${selectedCourse.course_id}-${Date.now()}`,
          amount: parseInt(selectedCourse.cost),
          currency: "NGN",
          redirect_url: `${process.env.NEXT_PUBLIC_API_URL}/verify-this-payment-dashboard?course_id=${encodeURIComponent(
            selectedCourse.course_id
          )}&cohort_id=${encodeURIComponent(selectedCourse.cohort_id)}&client_id=${encodeURIComponent(client_id)}`,
          payment_options: "card,banktransfer,ussd",
          customizations: {
            title: "iLearn Africa Course Payment",
            description: `Payment for ${selectedCourse.course_name} - ${selectedCourse.cohort_name}`,
            logo: `${window.location.origin}/images/logo/ilearn-logo.png`,
          },
        };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/initialize-payment`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.data && response.data.data.link) {
          sessionStorage.setItem("payment_payload", JSON.stringify(payload));
          window.location.href = response.data.data.link;
        } else {
          throw new Error("Payment URL not returned in response.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.details
            ? Object.values(error.response.data.details).join(", ")
            : "Failed to initiate payment. Please try again.");
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="New Course Registration" />
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-600" />
        </div>
      </DefaultLayout>
    );
  }

  if (error && !selectedCourse) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="New Course Registration" />
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>Error: {error}</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="New Course Registration" />

      <div className="grid grid-cols-1 gap-8">
        {/* Courses Table (shown when no course is selected) */}
        {!selectedCourse && (
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                      Course Name
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Cost
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Start Date
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={`${course.course_id}-${course.cohort_id}`}>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {course.course_name}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {course.cost !== "N/A" ? `₦${parseInt(course.cost).toLocaleString()}` : "N/A"}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {format(new Date(course.start_date), 'MMMM do, yyyy')}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <button
                            onClick={() => handleSelectCourse(course)}
                            className="inline-block rounded-lg bg-indigo-600 text-white py-2 px-4 text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                          >
                            Register
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Form (shown when course is selected) */}
        {selectedCourse && (
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <button
              onClick={() => setSelectedCourse(null)}
              className="mb-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-600"
            >
              ← Back to courses
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Course Registration Summary
            </h2>

            {/* Course Summary */}
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {selectedCourse.course_name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Cohort:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedCourse.cohort_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Start Date:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedCourse.start_date), 'MMMM do, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Course Fee:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ₦{parseInt(selectedCourse.cost).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Payment Method
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payOnline"
                      checked={paymentMethod === 'payOnline'}
                      onChange={handlePaymentMethodChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Pay Online (Credit/Debit Card, Bank Transfer, USSD)
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferNow"
                      checked={paymentMethod === 'transferNow'}
                      onChange={handlePaymentMethodChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Transfer Now (Manual Bank Transfer)
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="alreadyPaid"
                      checked={paymentMethod === 'alreadyPaid'}
                      onChange={handlePaymentMethodChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Already Paid (Upload Proof)
                    </span>
                  </label>
                </div>
              </div>

              {/* Additional payment details based on method */}
              {(paymentMethod === "transferNow" || paymentMethod === "alreadyPaid") && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Select Amount
                    </label>
                    <select
                      value={selectedAmount}
                      onChange={handleAmountChange}
                      required={paymentMethod === "transferNow" || paymentMethod === "alreadyPaid"}
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

                  {paymentMethod === "transferNow" && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Bank Transfer Details
                      </h4>
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
                  )}

                  {paymentMethod === "alreadyPaid" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Upload Proof of Payment
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFileChange}
                          required={paymentMethod === "alreadyPaid"}
                          className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-gray-900 focus:border-indigo-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Accepted formats: JPEG, PNG, PDF (max 5MB)
                        </p>
                      </div>
                      {previewUrl && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Preview
                          </p>
                          <img
                            src={previewUrl}
                            alt="Payment Proof Preview"
                            className="mt-2 max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                      {paymentProof && !previewUrl && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          PDF uploaded: {paymentProof.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={consentIP}
                    onChange={(e) => setConsentIP(e.target.checked)}
                    required
                    className="mt-1 mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="text-base text-gray-600 dark:text-gray-300 font-semibold">
                    I understand that presentation slides, recorded sessions, and tools provided during this training are
                    the intellectual property of iLearn Africa and are not to be reproduced, redistributed, or hosted elsewhere without written permission.
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={consentSharing}
                    onChange={(e) => setConsentSharing(e.target.checked)}
                    required
                    className="mt-1 mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="text-base dark:text-gray-300 font-semibold">
                    I acknowledge that unauthorized duplication or sharing of course materials is a breach of intellectual property rights and will attract legal action.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || 
                    !consentIP || 
                    !consentSharing || 
                    (paymentMethod === "transferNow" && !selectedAmount) ||
                    (paymentMethod === "alreadyPaid" && (!selectedAmount || !paymentProof))
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Processing...
                    </>
                  ) : paymentMethod === "transferNow" ? (
                    "I Have Completed This Payment"
                  ) : paymentMethod === "alreadyPaid" ? (
                    "Submit Payment Proof"
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default RegistrationPage;