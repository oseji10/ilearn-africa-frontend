"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPrint, faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientDetails, setClientDetails] = useState(null);
  const modalRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");

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
          `${process.env.NEXT_PUBLIC_API_URL}/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPayments(response.data.payments);
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
        link.setAttribute("download", `invoice-${transaction_reference}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.error("Failed to download the invoice", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the invoice", error);
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
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleAddPaymentClick}
      >
        <FontAwesomeIcon icon={faPlus} /> Add Payment
      </button>

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
                    {payment.client_name}
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.transaction_reference}
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.amount}
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.payment_date}
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.payment_method}
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.status}
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
                        onClick={() =>
                          downloadInvoice(payment.transaction_reference)
                        }
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button className="hover:text-primary">
                        <FontAwesomeIcon icon={faPrint} />
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
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Enter Client ID</h2>
            <form onSubmit={handleClientSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Client ID
                </label>
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && clientDetails && (
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Make Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">Select Payment Method</option>
                  <option value="bank">Bank</option>
                  <option value="pos">POS</option>
                  <option value="transfer">Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="transactionReference"
                  className="block text-sm font-medium text-gray-700"
                >
                  Transaction Reference
                </label>
                <input
                  type="text"
                  id="transactionReference"
                  value={transactionReference}
                  onChange={handleTransactionReferenceChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
