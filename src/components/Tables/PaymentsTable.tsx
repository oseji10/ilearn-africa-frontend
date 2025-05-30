"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { CSVLink } from "react-csv";

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const openHistoryModal = async (payment) => {
    setSelectedPayment(payment);
    setIsHistoryModalOpen(true); // Open the modal first
    // Fetch the payment history based on the selected payment
    await fetchPaymentHistory(payment.transaction_reference);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setPaymentHistory([]); // Clear history when modal closes
  };

  const fetchPaymentHistory = async (transactionReference) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payment-history/${transactionReference}`, // Adjust endpoint as necessary
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPaymentHistory(response.data.history); // Assuming the response has a 'history' field
    } catch (err) {
      console.error("Failed to fetch payment history", err);
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
          `${process.env.NEXT_PUBLIC_API_URL}/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments); // Set initial filtered payments
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = payments.filter((payment) => {
        const clientName = `${payment.clients.title || ''} ${payment.clients.firstname || ''} ${payment.payment_method || ''} ${payment.created_at || ''}  ${payment.clients.othernames || ''} ${payment.clients.surname || ''}`.toLowerCase();
        const transactionReference = payment.transaction_reference.toLowerCase();
        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          transactionReference.includes(searchTerm.toLowerCase()) ||
          payment.client_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [searchTerm, payments]);

  const downloadInvoice = async (transaction_reference) => {
    setIsDownloading(true);
    setActiveTransaction(transaction_reference);

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
        link.setAttribute(
          "download",
          `Payment_Receipt-${transaction_reference}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setActiveTransaction(null);
      } else {
        console.error("Failed to download the invoice", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the invoice", error);
    } finally {
      setIsDownloading(false); // Hide spinner
    }
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



  

  const columns = [
    {
      name: "Client ID",
      selector: (row) => row?.client_id,
      sortable: true,
    },
    {
      name: "Client Name",
      selector: (row) => `${row.clients?.title || ''} ${row.clients?.firstname || ''} ${row.clients?.othernames || ''} ${row.clients?.surname || ''}`,
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => row.courses?.course_name,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => {
        // Check if part_payments exists and has items; if so, sum their amounts
        const amount = row.part_payments?.length > 0
          ? row?.part_payments.reduce((total, payment) => total + Number(payment.amount), 0)
          : row?.amount;
    
        // Format the amount as a number with currency
        return `NGN${Number(amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
      sortable: true,
    }
    
    ,
    
    {
      name: "Payment Date",
      selector: (row) => format(new Date(row.created_at), "EEEE, MMMM do, yyyy"),
      sortable: true,
    },
    {
      name: "Payment Method",
      selector: (row) => row.payment_method,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            row.status === "1"
              ? "bg-success text-success"
              : row.status === "0"
              ? "bg-warning text-warning"
              : ""
          }`}
        >
          {row.status === "1" || 1
            ? "PAID"
            : row.status === "0" || 0
            ? "UNPAID"
            : "N/A"}
        </p>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        row.status === "1" || 1 && (
          <>
          <button
            disabled={isDownloading}
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => downloadInvoice(row.transaction_reference)}
          >
            {isDownloading && activeTransaction === row.transaction_reference ? (
              <span>
                Downloading. Please wait... <FontAwesomeIcon icon={faSpinner} spin />
              </span>
            ) : (
              <span>Receipt <FontAwesomeIcon icon={faDownload} /></span>
            )}
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevent default anchor behavior
              openHistoryModal(row); // Open the modal
            }}
            className="text-blue-600 underline ml-4"
          >
            Payment History
          </a>
          </>
        )
      ),
    },
  ];

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <CSVLink data={filteredPayments} filename={"payments.csv"}>
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Download CSV
        </button>
      </CSVLink>
      <DataTable
        columns={columns}
        data={filteredPayments}
        pagination
        selectableRows
        persistTableHead
        highlightOnHover
        striped
        responsive
        fixedHeader
        fixedHeaderScrollHeight="500px"
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search Payments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        }
        subHeaderAlign="right"
      />

      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white p-8 rounded-lg">
            <h2>Installmental Payment History</h2>
            {paymentHistory && paymentHistory.length > 0 ? (
              <ul>
                {paymentHistory.map((history, index) => (
                  <li key={index}>
                    {history.part_payments && history.part_payments.length > 0 ? (
                      history.part_payments.map((partPayment, idx) => (
                        <div key={idx}>
                          <b>Payment of ₦{partPayment.amount} made on {format(new Date(partPayment.created_at), "EEEE, MMMM do, yyyy")}</b>
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

export default PaymentsTable;
