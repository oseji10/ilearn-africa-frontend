"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import Link from "next/link";

const PendingPartPaymentsTable = () => {
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
  const [details, setDetails] = useState([]);

  const router = useRouter();


  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedRow, setSelectedRow] = useState(null);
const [newAmount, setNewAmount] = useState("");


const handleEditClick = (row) => {
  setSelectedRow(row); // Set the row being edited
  setIsModalOpen(true); // Open the modal
};

const handleModalClose = () => {
  setIsModalOpen(false); // Close the modal
  setNewAmount(""); // Reset the input
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

    if (response !== 201) {
      throw new Error("Failed to update payment.");
    }

    alert("Payment updated successfully!");
    handleModalClose(); // Close modal on success
    window.location.reload();
  } catch (err) {
    setError(err.message);
    setLoading(false);
  }
};

// Example usage (not within useEffect):
useEffect(() => {
  // Trigger handleSubmit based on certain dependencies, if needed.
}, []);

// useEffect(() => {
//   const fetchPayments = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("No auth token found");
//       }

//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/pending-part-payments`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const allPayments = response.data.payments || [];

//       // Filter only part payments that are pending
//       const pendingPartPayments = allPayments.flatMap(payment =>
//         payment.part_payments.filter(partPayment => partPayment.status === "pending")
//       );

//       setPayments(pendingPartPayments); // Set only pending part payments
//       setDetails(allPayments);
//       // const clientName = details.clients ? `${details.clients.firstname} ${details.clients.surname}` : "Unknown";
//       // console.log(clientName);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   fetchPayments();
// }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
  
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/pending-part-payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        setPayments(response.data.payments);
        setOtherReference(response.data.payments.other_reference);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // router.refresh() <-- Remove this line
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
            }
          }
        );
        setCourses(response.data.courses);
      } catch (err) {
        console.error("Failed to fetch courses:", err.message);
      }
    };
  
    // Make sure payment is defined before using it in fetchProof
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
              }
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
  }, [otherReference]); // Remove `router` from dependencies
  

  
  useEffect(() => {
    if (searchTerm) {
      const filtered = details.filter((detail) => {
        const clientName = `${detail.clients?.firstname || ''} ${detail.clients?.surname || ''} ${detail.clients?.othernames || ''} ${detail.payments?.courses?.course_id || ''} ${detail.payments?.courses?.course_name || ''}`.toLowerCase();
        const transactionReference = `${detail.payments?.transaction_reference || ''}`.toLowerCase();
        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          transactionReference.includes(searchTerm.toLowerCase()) ||
          payment?.client_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
      setDetails(details);
    }
  }, [searchTerm, payments]);



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




  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
  }, []);

  const confirmPayment = useCallback(
    async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      if (!confirmReceipt) {
        setError("You must confirm receipt of this payment.");
        return;
      }

      const paymentData = {
        client_id: selectedPayment.client_id,
        // transaction_reference: transactionReference,
        other_reference: selectedPayment.payment[0].other_reference
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
          window.location.reload();
          // const timer = setTimeout(() => {
          //   router.push("/admission/process-admission");
          // }, 5 * 1000);
        } else {
          throw new Error("Payment confirmation failed");
        }
      } catch (error) {
        setError(error.message);
      }
      setIsSubmitting(false);
      // router.refresh()
    },
    [selectedPayment, transactionReference, confirmReceipt, router, closeModal]
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          checked={isSelectAllChecked}
          // onChange={handleSelectAll}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedPayments.includes(row.transaction_reference)}
          // onChange={() => handleCheckboxChange(row.transaction_reference)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
       {
      name: "Name",
      selector: (row) => `${row.clients?.firstname || ''} ${row.clients?.surname || ''} ${row.clients?.othernames || ''}`,
      // selector: (row) => {
      //   const clientName = row.clients?.firstname || '';  // Define clientName inside the function
      //   return `${clientName}`;
      // },
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => `${row.payment[0]?.courses?.course_name || ''}`,
      // selector: (row) => `${row.transaction_reference  === null ? row.other_reference : row.transaction_reference || ''}`,
     
      sortable: true,
    },

    
    {
      name: "Amount",
      // selector: (row) => `${row.created_at || ''} `,
      selector: (row) => `${'₦'}${Number(row.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} `,
      
      sortable: true,
    },
    {
      name: "Date of Transaction",
      selector: (row) => `${format(new Date(row.created_at), 'MMM do, yyyy')} `,
      // selector: (row) => `${row.created_at || ''} `,
      
      sortable: true,
    },
    
    {
      name: "Status",
      selector: (row) => {
        // console.log("Row Part Payments:", row.part_payments); // Debugging

  
  const status = row?.status; // Extract status
        return (
          <p
            className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
              status === "paid"
                ? "bg-success text-success"
                : status === "pending"
                ? "bg-danger text-danger"
                : ""
            }`}
          >
            {status === "pending"
              ? "PENDING"
              : status === "paid"
              ? "PAID"
              : status === "rejected"
              ? "REJECTED"
              : "N/A"}
          </p>
        );
      },
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
              Edit Amount
            </a>
          </div>
        ),
      },
    
    

    {
      name: "",
      cell: (row) => (
        <div className="flex items-center space-x-3.5">
        
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => handleEyeClick(row)}
          >
            <FontAwesomeIcon icon={faEye} /> Confirm Payment
          </button>
        </div>

        
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

      &nbsp;

     
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

{selectedPayment && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
      <button
        className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-900"
        onClick={closeModal}
      >
        Close
      </button>
      <h3 className="text-lg font-semibold mb-4">Payment Confirmation</h3>
      <p className="mb-2">Client ID: {selectedPayment.client_id}</p>
      {/* <p className="mb-2">Client ID: {selectedPayment.transaction_reference}</p> */}
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
        &nbsp; I confirm that I have received this payment.
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
        style={{color: "red"}}
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
              // Optionally, close the modal or refresh the payment list
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
      {/* <input type="text" value={selectedRow.client_id} /> */}

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

export default PendingPartPaymentsTable;
