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

  const columns = [
    {
      name: "Client ID",
      selector: (row) => row.client_id,
      sortable: true,
    },
    {
      name: "Client Name",
      selector: (row) => `${row.clients.title || ''} ${row.clients.firstname || ''} ${row.clients.othernames || ''} ${row.clients.surname || ''}`,
      sortable: true,
    },
    {
      name: "Transaction Reference",
      selector: (row) => row.transaction_reference,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => `NGN${Number(row.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      sortable: true,
    },
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
    </div>
  );
};

export default PaymentsTable;
