"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPrint, faPlus, faDownload, faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";
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
  const [activeTransaction, setActiveTransaction] = useState(null); 

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingClientId, setLoadingClientId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  


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
        // console.log(response.data)
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




  

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }





  const handleApproval = async (event, transaction_reference) => {
    event.preventDefault();
    setIsSubmitting(true);
    setActiveTransaction(transaction_reference); // Set the active transaction

    const approvalData = {
      transaction_reference: transaction_reference
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/generate-receipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          mode: "cors",
          body: JSON.stringify(approvalData)
        }
      );

      if (response.ok) {
        alert("Receipt sent successfully");
        // Clear the active transaction once the process is complete
        setActiveTransaction(null);
      } else {
        setError("There was an error emailing this receipt");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred");
    }
    setIsSubmitting(false);
  };

  const downloadReceipt = async (event, transaction_reference) => {
    // console.log(admissionNumber);
    event.preventDefault();
    setIsDownloading(true);
    setActiveTransaction(transaction_reference);

    const transactionData = {
      transaction_reference: transaction_reference
    };

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
          mode: "cors",
          body: JSON.stringify(transactionData)
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `receipt-${transaction_reference}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setActiveTransaction(null);
      } else {
        console.error("Failed to download the receipt", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the receipt", error);
    }
    finally {
      setIsDownloading(false); // Hide spinner
    }
  };


  return (
    <div>
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
                {/* <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                  Client ID
                </th> */}
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
                  {/* <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {payment.client_id}
                  </td> */}
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
                    {payment.status === 1 && (
                      <>
                      <FontAwesomeIcon icon={faDownload} 
                      // onClick={downloadReceipt}
                      onClick={(event) => downloadReceipt(event, payment.transaction_reference)}
                      />
                      
  <button
    disabled={isSubmitting}
    className="px-4 py-2 bg-green-500 text-white rounded"
    onClick={(event) => handleApproval(event, payment.transaction_reference)}
  >
    {isSubmitting && activeTransaction === payment.transaction_reference ? (
      <span>
        Sending. Please wait... <FontAwesomeIcon icon={faSpinner} spin />
      </span>
    ) : (
      <span>
        <FontAwesomeIcon icon={faEnvelope} /> Email Receipt
      </span>
    )}
  </button>
  </>
)}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MyPaymentsTable;
