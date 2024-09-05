"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { useRouter } from "next/navigation";

const ProcessCertificatesTable = () => {
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [confirmReceipt, setConfirmReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();
  const [selectedAdmissions, setSelectedAdmissions] = useState([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/process_certificate`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdmissions(response.data.admissions);
        setFilteredAdmissions(response.data.admissions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAdmissions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = admissions.filter((admission) => {
        const clientName = `${admission.clients?.firstname || ''} ${admission.clients?.surname || ''} ${admission.clients?.othernames || ''} ${admission.payments?.courses?.course_id || ''} ${admission.payments?.courses?.course_name || ''}`.toLowerCase();
        const courseName = `${admission.payments?.courses?.course_name || ''}`.toLowerCase();
        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          courseName.includes(searchTerm.toLowerCase()) ||
          admission.client_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredAdmissions(filtered);
    } else {
      setFilteredAdmissions(admissions);
    }
  }, [searchTerm, admissions]);

  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
  }, []);

  const handleEyeClick = (admission) => {
    setSelectedAdmission(admission);
  };

  const closeModal = () => {
    setSelectedAdmission(null);
  };

  const handleSelectAll = () => {
    if (isSelectAllChecked) {
      setSelectedAdmissions([]);
    } else {
      const allAdmissionIds = filteredAdmissions.map((admission) => admission.admission_number);
      setSelectedAdmissions(allAdmissionIds);
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };

  const handleProcessAll = async () => {
    if (selectedAdmissions.length === 0) {
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
          body: JSON.stringify({ admission_number: selectedAdmissions }), // Send the array of admission numbers
        }
      );
  
      if (response.ok) {
        setProgress(100);
        setAdmissions((prevAdmissions) =>
          prevAdmissions.filter(
            (admission) => !selectedAdmissions.includes(admission.admission_number)
          )
        );
        alert("All selected admissions have been processed successfully.");
        setSelectedAdmissions([]);
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
        { admission_number: selectedAdmission.admission_number },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Certificate issued successfully!");
        setAdmissions((prevAdmissions) =>
          prevAdmissions.map((admission) =>
            admission.admission_number === selectedAdmission.admission_number
              ? { ...admission, status: "COMPLETED" }
              : admission
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

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          checked={isSelectAllChecked}
          onChange={handleSelectAll}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedAdmissions.includes(row.admission_number)}
          onChange={() => handleCheckboxChange(row.admission_number)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    // {
    //   name: "Client ID",
    //   selector: (row) => row.client_id,
    //   sortable: true,
    // },
    {
      name: "Name",
      selector: (row) => `${row.clients?.firstname || ''} ${row.clients?.surname || ''} ${row.clients?.othernames || ''}`,
      sortable: true,
    },
    {
      name: "Course Registered",
      selector: (row) => `${row.payments?.courses?.course_id || ''} - ${row.payments?.courses?.course_name || ''}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            row.status === "COMPLETED"
              ? "bg-success text-success"
              : row.status === "ADMITTED"
              ? "bg-danger text-danger"
              : ""
          }`}
        >
          {row.status === "ADMITTED"
            ? "NOT ISSUED"
            : row.status === "COMPLETED"
            ? "ISSUED"
            : "N/A"}
        </p>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-3.5">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => handleEyeClick(row)}
          >
            <FontAwesomeIcon icon={faEye} /> View
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
      <CSVLink data={filteredAdmissions} filename={"admissions.csv"}>
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Download CSV
        </button>
      </CSVLink>

      &nbsp;

      <button
        className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${
          isProcessingAll ? "cursor-not-allowed" : ""
        }`}
        onClick={handleProcessAll}
        disabled={isProcessingAll}
      >
        {isProcessingAll ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin /> Processing...
          </>
        ) : (
          "Process All Selected"
        )}
      </button>

      <input
        type="text"
        placeholder="Search by name, course, or client ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      <DataTable
        columns={columns}
        data={filteredAdmissions}
        pagination
        highlightOnHover
        pointerOnHover
        striped
      />

      {selectedAdmission && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Admission Details</h3>
            {/* <p className="mb-2">Client ID: {selectedAdmission.client_id}</p> */}
            <p className="mb-2">
              Name: {`${selectedAdmission.clients.firstname} ${selectedAdmission.clients.surname} ${selectedAdmission.clients.othernames}`}
            </p>
            <p className="mb-2">
              Course Registered:{" "}
              {`${selectedAdmission.payments?.courses?.course_id || ''} - ${selectedAdmission.payments?.courses?.certification_name || ''}`}
            </p>
            <p className="mb-4">
              Status:{" "}
              {selectedAdmission.status === "ADMITTED"
                ? "NOT ISSUED"
                : selectedAdmission.status === "COMPLETED"
                ? "ISSUED"
                : "N/A"}
            </p>
            <label className="mb-4">
              <input
                type="checkbox"
                checked={confirmReceipt}
                onChange={handleConfirmReceiptChange}
              />
              &nbsp; Confirm receipt of all necessary documents
            </label>
            <br />
            <button
              className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${
                isSubmitting || !confirmReceipt ? "cursor-not-allowed" : ""
              }`}
              onClick={handleApproval}
              disabled={isSubmitting || !confirmReceipt}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Please wait...
                </>
              ) : (
                "Issue Certificate"
              )}
            </button>

            <button
            style={{background: 'red'}}
              className="mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessCertificatesTable;
