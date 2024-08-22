"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPrint, faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns';
import styles from "./spinner.module.css";
import Router from "next/navigation";
import { useRouter } from "next/navigation";

const PendingPaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientDetails, setClientDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [confirmReceipt, setConfirmReceipt] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingClientId, setLoadingClientId] = useState(null);

  const router = useRouter();

  const handlePaymentMethodChange = useCallback((e) => {
    setPaymentMethod(e.target.value);
  }, []);

  const handleTransactionReferenceChange = useCallback((e) => {
    setTransactionReference(e.target.value);
  }, []);

  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
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
          `${process.env.NEXT_PUBLIC_API_URL}/pending-payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPayments(response.data.payments);
        // console.log(response.data.payments);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        router.refresh()
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
    setIsConfirmPaymentModalOpen(false);
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

  const confirmPayment = useCallback(
    async (event) => {
      event.preventDefault();

      if (!confirmReceipt) {
        setError("You must confirm receipt of the payment.");
        return;
      }

      const paymentData = {
        client_id: selectedPayment.client_id,
        transaction_reference: transactionReference,
        other_reference: selectedPayment.other_reference
      };

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/confirm-payment`,
          {
            method: "PUT",
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
          throw new Error("Payment confirmation failed");
        }
      } catch (error) {
        setError(error.message);
      }
    },
    [selectedPayment, transactionReference, confirmReceipt, closeModal]
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <div>
        {/* <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleAddPaymentClick}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Payment
        </button> */}
      </div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto  min-w-full ">
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
                  Status
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.transaction_reference}>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-black dark:text-white">
                    {payment.client_id}
                  </td>
                  <td className=" px-4 py-4 font-medium text-black dark:text-white">
                  {payment.clients.title}. {payment.clients.firstname} {payment.clients.othernames} {payment.clients.surname}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-black dark:text-white">
                    {payment.transaction_reference  === null ? payment.other_reference : payment.transaction_reference}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-black dark:text-white">
                  NGN{Number(payment.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                  <td className="px-4 py-4 text-black dark:text-white">
                  {/* {format(new Date(payment.payment_date), 'EEEE, MMMM do, yyyy')} */}
                  {format(new Date(payment.created_at), 'EEEE, MMMM do, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-black dark:text-white">
                    <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        payment.status === 1
                          ? "bg-success text-success"
                          : payment.status === 0
                            ? "bg-warning text-warning"
                            : ""
                      }`}>{payment.status === 0 ? "PENDING" : payment.status === 1 ? "PAID" : ""}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsConfirmPaymentModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} /> Confirm Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isClientModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg" ref={modalRef}>
            <h2 className="text-xl font-semibold mb-4">Search Client</h2>
            <form onSubmit={handleClientSubmit}>
              <label className="block mb-2">Client ID:</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-4"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg" ref={modalRef}>
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <form onSubmit={handlePaymentSubmit}>
              <label className="block mb-2">Course:</label>
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="border rounded px-3 py-2 w-full mb-4"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
              <label className="block mb-2">Amount:</label>
              <input
                type="text"
                value={amount}
                readOnly
                className="border rounded px-3 py-2 w-full mb-4"
              />
              <label className="block mb-2">Payment Method:</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="border rounded px-3 py-2 w-full mb-4"
                required
              />
              <label className="block mb-2">Transaction Reference:</label>
              <input
                type="text"
                value={transactionReference}
                onChange={handleTransactionReferenceChange}
                className="border rounded px-3 py-2 w-full mb-4"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit Payment
              </button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isConfirmPaymentModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg" ref={modalRef}>
            <h2 className="text-xl font-semibold mb-4">Confirm Payment</h2>
            <form onSubmit={confirmPayment}>
              <label className="block mb-2">Transaction Reference:</label>
              <input
                type="text"
                value={transactionReference}
                onChange={handleTransactionReferenceChange}
                className="border rounded px-3 py-2 w-full mb-4"
                required
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={confirmReceipt}
                  onChange={handleConfirmReceiptChange}
                  className="mr-2"
                  required
                />
                <label className="text-gray-700">Confirm receipt of payment</label>
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Confirm Payment
              </button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPaymentsTable;
