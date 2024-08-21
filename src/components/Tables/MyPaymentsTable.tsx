"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPrint, faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns';
import styles from "./spinner.module.css";


const MyPaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientDetails, setClientDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingClientId, setLoadingClientId] = useState(null);

  const handlePaymentMethodChange = useCallback((e) => {
    setPaymentMethod(e.target.value);
  }, []);

  const handleTransactionReferenceChange = useCallback((e) => {
    setTransactionReference(e.target.value);
  }, []);

  const handleCourseChange = useCallback(
    (e) => {
      const selectedCourseId = e.target.value;
      setSelectedCourse(selectedCourseId);

      const course = courses.find(
        (course) => course.course_id === selectedCourseId
      );
      if (course) {
        setAmount(course.cost); // Assuming the amount is stored in course.course_amount
      }
    },
    [courses]
  );

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/my-payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPayments(response.data.payments);
        console.log(response.data)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/course_list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCourses(response.data.courses);
      } catch (err) {
        console.error("Failed to fetch courses:", err.message);
      }
    };

    fetchPayments();
    fetchCourses();
  }, []);

  const handleEyeClick = useCallback((payment) => {
    setSelectedPayment(payment);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPayment(null);
    setIsClientModalOpen(false);
    setIsPaymentModalOpen(false);
    setClientDetails(null);
    setClientId("");
  }, []);

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleAddPaymentClick = useCallback(() => {
    setIsClientModalOpen(true);
  }, []);

  const handleClientSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setClientDetails(response.data.client[0]);
        setIsClientModalOpen(false);
        setIsPaymentModalOpen(true);
      } catch (err) {
        console.error("Failed to fetch client details:", err.message);
        setError("Failed to fetch client details. Please try again.");
      }
    },
    [clientId]
  );

  const handlePaymentSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const paymentData = {
        client_id: clientDetails.client_id,
        course_id: selectedCourse,
        payment_method: paymentMethod,
        transaction_reference: transactionReference,
        amount: amount,
      };

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manual-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
          }
        );

        if (response.ok) {
          setError(null);
          closeModal();
        } else {
          throw new Error("Payment submission failed");
        }
      } catch (error) {
        setError(error.message);
      }
    },
    [
      clientDetails,
      selectedCourse,
      paymentMethod,
      transactionReference,
      amount,
      closeModal,
    ]
  );

  const downloadInvoice = async (transaction_reference) => {
    setIsDownloading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/generate-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transaction_reference }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Payement_Receipt-${transaction_reference}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.error("Failed to download the invoice", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the invoice", error);
    } finally {
      setIsDownloading(false); // Hide spinner
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      {/* <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleAddPaymentClick}
      >
        <FontAwesomeIcon icon={faPlus} /> Add Payment
      </button> */}
<div>

</div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr
                style={{ textAlign: "left" }}
                className="bg-gray-2 text-left dark:bg-meta-4"
              >
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                  Client ID
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Client Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Transaction Reference
                </th>

                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Amount
                </th>

                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Payment Date
                </th>

                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Payment Method
                </th>

                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>

                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.transaction_reference}>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.client_id}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  {payment.clients.title} {payment.clients.firstname} {payment.clients.othernames} {payment.clients.surname}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.transaction_reference}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    
                    NGN{Number(payment.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  {format(new Date(payment.created_at), 'EEEE, MMMM do, yyyy')}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.payment_method}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        payment.status === 1
                          ? "bg-success text-success"
                          : payment.status === 0
                            ? "bg-warning text-warning"
                            : ""
                      }`}
                    >
                      {payment.status === 1
                        ? "PAID"
                        : payment.status === 0
                          ? "PENDING"
                          : "N/A"}
                          </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleEyeClick(payment)} 
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="hover:text-primary"
                        onClick={() => downloadInvoice(payment.transaction_reference)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <span className={styles.loader}></span> // Display spinner
                        ) : (
                          <FontAwesomeIcon icon={faDownload} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isClientModalOpen && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <h2>Add Payment</h2>
            <form onSubmit={handleClientSubmit}>
              <div className="mb-4">
                <label htmlFor="clientId">Client ID</label>
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Next
              </button>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <h2>Manual Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="transactionReference">Transaction Reference</label>
                <input
                  type="text"
                  id="transactionReference"
                  value={transactionReference}
                  onChange={handleTransactionReferenceChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="course">Course</label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPaymentsTable;
