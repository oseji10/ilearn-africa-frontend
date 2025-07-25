"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPen, faSpinner, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import Link from "next/link";

const PendingPaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // New state for view modal
  const [clientId, setClientId] = useState("");
  const [clientDetails, setClientDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [confirmReceipt, setConfirmReceipt] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingClientId, setLoadingClientId] = useState(null);
  const [link, setLink] = useState("");
  const [otherReference, setOtherReference] = useState("");
  const [proof, setProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [newAmount, setNewAmount] = useState("");

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewAmount("");
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/edit_payment`,
        {
          id: selectedRow.id,
          edited_payment: newAmount,
          client_id: selectedRow.client_id,
          transaction_reference: selectedRow.transaction_reference,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to update payment.");
      }

      alert("Payment updated successfully!");
      handleModalClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

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
        setOtherReference(response.data.payments.other_reference);
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

    if (otherReference) {
      const fetchProof = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No auth token found");
          }
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/proof-of-payment/${otherReference}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setProof(response.data);
        } catch (err) {
          console.error("Failed to fetch proof of payment:", err.message);
        }
      };

      fetchProof();
    }

    fetchPayments();
    fetchCourses();
  }, [otherReference]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = payments.filter((payment) => {
        const clientName = `${payment.clients?.firstname || ''} ${payment.clients?.surname || ''} ${payment.clients?.othernames || ''} ${payment.payments?.courses?.course_id || ''} ${payment.payments?.courses?.course_name || ''}`.toLowerCase();
        const transactionReference = `${payment.transaction_reference || ''}`.toLowerCase();
        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          transactionReference.includes(searchTerm.toLowerCase()) ||
          payment?.client_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [searchTerm, payments]);

  const handleEyeClick = useCallback((payment) => {
    setSelectedPayment(payment);
    setIsConfirmPaymentModalOpen(true); // Open confirmation modal
  }, []);

  const handleViewClick = useCallback((payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true); // Open view modal
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPayment(null);
    setIsClientModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsConfirmPaymentModalOpen(false);
    setIsViewModalOpen(false); // Close view modal
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

  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
  }, []);

  const handleSelectAll = () => {
    if (isSelectAllChecked) {
      setSelectedPayments([]);
    } else {
      const allPaymentIds = filteredPayments.map((payment) => payment.transaction_reference);
      setSelectedPayments(allPaymentIds);
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };

  const handleCheckboxChange = (transactionReference) => {
    setSelectedPayments((prev) =>
      prev.includes(transactionReference)
        ? prev.filter((id) => id !== transactionReference)
        : [...prev, transactionReference]
    );
  };

  const handleProcessAll = async () => {
    if (selectedPayments.length === 0) {
      alert("Please select at least one admission to process.");
      return;
    }

    setIsProcessingAll(true);
    setProgress(0);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/batch-process`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transaction_reference: selectedPayments }),
        }
      );

      if (response.ok) {
        setProgress(100);
        setPayments((prevPayments) =>
          prevPayments.filter(
            (payment) => !selectedPayments.includes(payment.transaction_reference)
          )
        );
        alert("All selected admissions have been processed successfully.");
        setSelectedPayments([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process admissions");
      }
    } catch (err) {
      console.error("Error processing all admissions:", err);
      alert("An error occurred while processing admissions. Please try again.");
    }

    setIsProcessingAll(false);
  };

  const handleApproval = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/certificate/issue`,
        { transaction_reference: selectedPayment.transaction_reference },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Certificate issued successfully!");
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment.transaction_reference === selectedPayment.transaction_reference
              ? { ...payment, status: "COMPLETED" }
              : payment
          )
        );
        closeModal();
      } else {
        throw new Error("Failed to issue certificate.");
      }
    } catch (err) {
      console.error("Error issuing certificate:", err);
      alert("An error occurred while issuing the certificate. Please try again.");
    }

    setIsSubmitting(false);
  };


const confirmPayment = useCallback(
  async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!confirmReceipt) {
      setError("You must confirm receipt of this payment.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const paymentData = {
        client_id: selectedPayment.client_id,
        other_reference: selectedPayment.other_reference,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/confirm-payment`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setError(null);
        alert("Payment confirmed successfully!");
        closeModal();
        window.location.reload();
      } else {
        throw new Error("Payment confirmation failed");
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setError("An error occurred while confirming the payment. Please try again.");
    }

    setIsSubmitting(false);
  },
  [selectedPayment, confirmReceipt, closeModal]
);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const columns = [
    // {
    //   name: (
    //     <input
    //       type="checkbox"
    //       checked={isSelectAllChecked}
    //       onChange={handleSelectAll}
    //     />
    //   ),
    //   cell: (row) => (
    //     <input
    //       type="checkbox"
    //       checked={selectedPayments.includes(row.transaction_reference)}
    //       onChange={() => handleCheckboxChange(row.transaction_reference)}
    //     />
    //   ),
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
    // },
    {
      name: "Name",
      selector: (row) => `${row.clients?.firstname || ''} ${row.clients?.surname || ''} ${row.clients?.othernames || ''}`,
      sortable: true,
      // allowOverflow: true,
    },
    {
      name: "Course",
      selector: (row) => `${row.courses?.course_name || ''}`,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) =>
        `${'₦'}${Number(row.part_payment).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      sortable: true,
    },
    {
      name: "Date of Transaction",
      selector: (row) => `${format(new Date(row.created_at), 'MMM do, yyyy')}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            row.status === 1
              ? "bg-success text-success"
              : row.status === 0
              ? "bg-danger text-danger"
              : ""
          }`}
        >
          {row.status === 0
            ? "PENDING"
            : row.status === 1
            ? "PAID"
            : row.status === 2
            ? "REJECTED"
            : "N/A"}
        </p>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-3.5">
          <a
            onClick={() => handleEditClick(row)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            <FontAwesomeIcon icon={faPen} />   
          </a>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => handleEyeClick(row)}
          >
            <FontAwesomeIcon icon={faThumbsUp} />  
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => handleViewClick(row)}
          >
            <FontAwesomeIcon icon={faEye} /> 
          </button>
        </div>
      ),
      allowOverflow: true,
    },
  ];

  return (
    <div>
      <CSVLink data={filteredPayments} filename={"payments.csv"}>
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Download CSV
        </button>
      </CSVLink>

      <input
        type="text"
        placeholder="Search by name, course, or client ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      <DataTable
        columns={columns}
        data={filteredPayments}
        pagination
        highlightOnHover
        pointerOnHover
        striped
      />

      {selectedPayment && isConfirmPaymentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md relative" ref={modalRef}>
            <button
              className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              Close
            </button>
            <h3 className="text-lg font-semibold mb-4">Payment Confirmation</h3>
            <p className="mb-2">Client ID: {selectedPayment.client_id}</p>
            <p className="mb-2">
              Name: {`${selectedPayment?.clients?.firstname || ''} ${selectedPayment?.clients?.surname || ''} ${selectedPayment?.clients?.othernames || ''}`}
            </p>
            <Link
              href={`${process.env.NEXT_PUBLIC_DOWNLOAD_LINK}${selectedPayment?.proof?.file_path}`}
              className="text-sm text-primary hover:underline"
              target="_blank"
            >
              View receipt
            </Link>
            <br /><br />
            <label className="mb-4">
              <input
                type="checkbox"
                checked={confirmReceipt}
                onChange={handleConfirmReceiptChange}
              />
               I confirm that I have received this payment.
            </label>
            <br />
            <button
              className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${
                isSubmitting || !confirmReceipt ? "cursor-not-allowed" : ""
              }`}
              onClick={confirmPayment}
              disabled={isSubmitting || !confirmReceipt}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Please wait...
                </>
              ) : (
                "Confirm Payment"
              )}
            </button>
            <button
              className="mt-4 ml-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={async () => {
                try {
                  const response = await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/reject-payment`,
                    {
                      transaction_reference: selectedPayment.transaction_reference,
                      other_reference: selectedPayment.other_reference,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    }
                  );

                  if (response.status === 200) {
                    alert("Payment has been rejected successfully.");
                    closeModal();
                  }
                } catch (error) {
                  console.error("Error rejecting payment:", error);
                  alert("Failed to reject payment.");
                }
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {selectedPayment && isViewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md relative" ref={modalRef}>
            <button
              className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              Close
            </button>
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            <p className="mb-2"><strong>Client ID:</strong> {selectedPayment.client_id}</p>
            <p className="mb-2"><strong>Name:</strong> {`${selectedPayment?.clients?.firstname || ''} ${selectedPayment?.clients?.surname || ''} ${selectedPayment?.clients?.othernames || ''}`}</p>
            <p className="mb-2"><strong>Course:</strong> {selectedPayment.courses?.course_name || 'N/A'}</p>
            <p className="mb-2"><strong>Amount:</strong> ₦{Number(selectedPayment.part_payment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="mb-2"><strong>Date of Transaction:</strong> {format(new Date(selectedPayment.created_at), 'MMM do, yyyy')}</p>
            <p className="mb-2"><strong>Payment Method:</strong> {selectedPayment.payment_method || 'N/A'}</p>
            <p className="mb-2"><strong>Transaction Reference:</strong> {selectedPayment.transaction_reference || 'N/A'}</p>
            <p className="mb-2"><strong>Other Reference:</strong> {selectedPayment.other_reference || 'N/A'}</p>
            <p className="mb-2"><strong>Status:</strong> {selectedPayment.status === 0 ? "PENDING" : selectedPayment.status === 1 ? "PAID" : selectedPayment.status === 2 ? "REJECTED" : "N/A"}</p>
            {selectedPayment?.proof?.file_path && (
              <Link
                href={`${process.env.NEXT_PUBLIC_DOWNLOAD_LINK}${selectedPayment?.proof?.file_path}`}
                className="text-sm text-primary hover:underline"
                target="_blank"
              >
                View Receipt
              </Link>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Payment</h2>
            <label className="block text-sm font-medium mb-2">
              Enter New Amount:
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="Enter amount"
            />
            <div className="flex items-center justify-end space-x-4 mt-4">
              <button
                onClick={handleModalClose}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPaymentsTable;