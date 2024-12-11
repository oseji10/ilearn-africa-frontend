"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPrint, faPlus, faDownload, faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns';
import styles from "./spinner.module.css";
import { useRouter } from 'next/navigation';
import { formatDate } from "../Date";
const MyPaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [clientDetails, setClientDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalRef = useRef(null);
  const [activeTransaction, setActiveTransaction] = useState(null); 

  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingClientId, setLoadingClientId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partPayment, setPartPayment] = useState(0);
  
const router = useRouter();

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




  

 
  const openModal = useCallback((payment) => {
    
    setActiveTransaction(payment);
    setClientId(payment.client_id);
    setPaymentId(payment.id);
    setIsPaymentModalOpen(true);
  }, []);
  



  const closeModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setFile(null); // Reset the file when closing the modal
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    if (selectedCourse) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTransaction, handleClickOutside]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file); // Store the file in the state
  };




  

  
  const handleCompletePayment = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);
      formData.append("part_payment", partPayment);
      formData.append("id", paymentId);

      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
  
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/top-up-payment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
  
        if (response.ok) {
          setError(null);
          closeModal(); // Close the modal here if the response is ok
          // Optionally, redirect or fetch new data instead of redirecting
        } else {
          throw new Error("Payment submission failed");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [file, clientId, partPayment, closeModal]
  );
  

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const openHistoryModal = (payment) => {
    setSelectedPayment(payment);
    setIsHistoryModalOpen(true); // Open the modal first
};

const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setPaymentHistory([]); // Clear history when modal closes
};

  
useEffect(() => {
  if (isHistoryModalOpen && selectedPayment) {
    const fetchPaymentHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return; // Early exit if no token is found
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/my-part-payment-history/${selectedPayment.id}`, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data.part_payments);
          setPaymentHistory(data.part_payments); // Set fetched part payments to paymentHistory
        } else {
          console.error("Failed to fetch payment history");
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
    };

    fetchPaymentHistory();
  }
}, [isHistoryModalOpen, selectedPayment]);




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



  const partPayments = [
    { "id": "5000", "amount": "5,000" },
    { "id": "10000", "amount": "10,000" },
    { "id": "15000", "amount": "15,000" },
    { "id": "20000", "amount": "20,000" },
    { "id": "25000", "amount": "25,000" },
    { "id": "30000", "amount": "30,000" },
    { "id": "35000", "amount": "35,000" },
    { "id": "40000", "amount": "40,000" },
    { "id": "45000", "amount": "45,000" },
    { "id": "50000", "amount": "50,000" },
    { "id": "55000", "amount": "55,000" },
    { "id": "60000", "amount": "60,000" },
    { "id": "65000", "amount": "65,000" },
    { "id": "70000", "amount": "70,000" },
    { "id": "75000", "amount": "75,000" },
    { "id": "80000", "amount": "80,000" },
    { "id": "85000", "amount": "85,000" },
    { "id": "90000", "amount": "90,000" },
    { "id": "95000", "amount": "95,000" },
    { "id": "100000", "amount": "100,000" },
    { "id": "105000", "amount": "105,000" },
    { "id": "110000", "amount": "110,000" },
    { "id": "115000", "amount": "115,000" },
    { "id": "120000", "amount": "120,000" },
    { "id": "125000", "amount": "125,000" },
    { "id": "130000", "amount": "130,000" },
    { "id": "135000", "amount": "135,000" },
    { "id": "140000", "amount": "140,000" },
    { "id": "145000", "amount": "145,000" },
    { "id": "150000", "amount": "150,000" },
    { "id": "155000", "amount": "155,000" },
    { "id": "160000", "amount": "160,000" },
    { "id": "165000", "amount": "165,000" },
    { "id": "170000", "amount": "170,000" },
    { "id": "175000", "amount": "175,000" },
    { "id": "180000", "amount": "180,000" },
    { "id": "185000", "amount": "185,000" },
    { "id": "190000", "amount": "190,000" },
    { "id": "195000", "amount": "195,000" },
    { "id": "200000", "amount": "200,000" },
   ];


   

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }


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
                  Cost
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Total Amount Paid
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
                    
                    NGN{Number(payment.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    NGN{Number(payment.part_payment).toLocaleString(undefined, {
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
  {parseFloat(payment.part_payment) < parseFloat(payment.amount) && (
  <button
    disabled={isSubmitting}
    className="px-4 py-2 bg-blue-500 text-white rounded"
    onClick={() => openModal(payment)} // Pass the entire payment object
  >
    Add Payment
  </button>
)}

<a
        href="#"
        onClick={(e) => {
          e.preventDefault(); // Prevent default anchor behavior
          openHistoryModal(payment); // Open the modal
        }}
        className="text-blue-600 underline ml-4"
      >
        Payment History
      </a>
    
    {payment.status === 1 && parseFloat(payment.part_payment) >= parseFloat(payment.amount) && (
      <>
        <FontAwesomeIcon
          icon={faDownload}
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


      {activeTransaction && isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="relative bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Balance Payment for {activeTransaction.courses.course_name}
            </h2>
            <form onSubmit={handleCompletePayment}>
              <input
                type="text"
                name="payment_id"
                value={activeTransaction.id}
                hidden
              />
              <div className="flex items-center justify-center">
                <input type="hidden" name="client_id" value={clientId} />
                <div className="mb-4">
                  <label
                    htmlFor="part_payment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter Amount Paid
                  </label>



                    {/* <input
                      type="number"
                      id="part_payment"
                      name="part_payment"
                      step="0.01"
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      value={partPayment} // Set the value to the state variable
                      onChange={(e) => setPartPayment(parseFloat(e.target.value) || 0)}
                    /> */}

<select
  name="part_payment"
  value={partPayment} // Maintain the selected course
  onChange={(e) => setPartPayment(parseFloat(e.target.value) || 0)} // Update the state on change
>
  <option value="" disabled>
    Select aamount paid
  </option>
  {partPayments.map((partPayment) => (
    <option key={partPayment.id} value={partPayment.id}>
      {partPayment.amount} 
    </option>
  ))}
</select>


                  <br /><br />

                  <label
                    htmlFor="file"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload Payment Proof
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-primary px-6 py-3 text-white font-semibold rounded-md hover:bg-opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
            <button
              className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}



{isHistoryModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div ref={modalRef} className="relative bg-white p-8 rounded-lg">
      <h2>Installmental Payment History</h2>
      {paymentHistory && paymentHistory.length > 0 ? (
        <ul>
          {paymentHistory.map((history, index) => (
            <li key={index}>
              {history.part_payments && history.part_payments.length > 0 ? (
                history.part_payments.map((partPayment, idx) => (
                  <div key={idx}>
                    <b>Payment of ₦{partPayment.amount} made on {formatDate(partPayment.created_at)}</b>
                  </div>
                ))
              ) : (
                <p>No installmental payments available.</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No payment history available.</p>
      )}
      {/* <button onClick={closeHistoryModal}>Close</button> */}
      <button
              className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-900"
              onClick={closeHistoryModal}
            >
              Close
            </button>
    </div>
  </div>
)}


  
    </div>
  );
};

export default MyPaymentsTable;
