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

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admitted`,
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

  const handleApproval = async (event, approved) => {
    event.preventDefault();
    setIsSubmitting(true);
    const approvalData = {
      admission_number: selectedAdmission.admission_number,
    };
    if (!confirmReceipt) {
      alert("Please confirm that you authorize the issuance of this certificate.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalData),
        }
      );

      if (response.ok) {
        alert(`This certificate has been ${approved ? "issued" : "disapproved for issuance"} successfully`);
        closeModal();
      } else {
        setError("There was an issue processing the certificate");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred");
    }
    setIsSubmitting(false);
    router.refresh();
  };

  const columns = [
    {
      name: "Client ID",
      selector: (row) => row.client_id,
      sortable: true,
    },
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
      <DataTable
        columns={columns}
        data={filteredAdmissions}
        pagination
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search Admissions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        }
        subHeaderAlign="right"
        highlightOnHover
        striped
        responsive
        fixedHeader
        fixedHeaderScrollHeight="500px"
      />

      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">CERTIFICATE ISSUANCE</h2>
            <hr />
            <br />
            <table width={"100%"}>
              <tbody>
                <tr>
                  <td width={"25%"}>
                    <strong>Client ID:</strong>
                  </td>
                  <td>{selectedAdmission.client_id}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Admission Number:</strong>
                  </td>
                  <td>{selectedAdmission.admission_number}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Name:</strong>
                  </td>
                  <td>
                    {selectedAdmission.clients?.firstname}{" "}
                    {selectedAdmission.clients?.surname}{" "}
                    {selectedAdmission.clients?.othernames}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Course Registered:</strong>
                  </td>
                  <td>
                    {selectedAdmission.payments?.courses?.course_id} -{" "}
                    {selectedAdmission.payments?.courses?.course_name}
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={confirmReceipt}
                onChange={handleConfirmReceiptChange}
                className="mr-2"
                required
              />
              <label className="text-gray-700">
                By clicking this button, you confirm that this client is eligible to be issued this certificate under your authorization.
              </label>
            </div>
            <button
              onClick={(event) => handleApproval(event, true)}
              disabled={isSubmitting}
              className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${
                isSubmitting ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isSubmitting ? (
                <span>
                  Please wait... <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                </span>
              ) : (
                'Issue Certificate'
              )}
            </button>
            &nbsp;
            <button
              className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-gray-700"
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
