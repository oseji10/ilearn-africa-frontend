"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faSpinner,
  faEye,
  faEnvelope,
  faEnvelopeOpen,
} from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const ClientCertificates = () => {
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [confirmReceipt, setConfirmReceipt] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);

  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
  }, []);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setAdmissions(response.data.certificates);
        setFilteredAdmissions(response.data.certificates); // Set initial filtered admissions
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
        const clientName =
          `${admission.clients?.title || ""} ${admission.clients?.firstname || ""} ${admission.clients?.othernames || ""} ${admission.clients?.surname || ""}`.toLowerCase();
        const admissionNumber = admission.admission_number.toLowerCase();
        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          admissionNumber.includes(searchTerm.toLowerCase()) ||
          admission.client_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredAdmissions(filtered);
    } else {
      setFilteredAdmissions(admissions);
    }
  }, [searchTerm, admissions]);

  const handleApproval = async (event, approved) => {
    event.preventDefault();
    if (!confirmReceipt) {
      alert(
        "Please confirm that you authorize the issuance of this certificate.",
      );
      return;
    }
    setIsSubmitting(true);

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
          body: JSON.stringify({
            admission_number: selectedAdmission.admission_number,
            approved,
          }),
        },
      );

      if (response.ok) {
        alert(
          `This certificate has been ${approved ? "issued" : "disapproved for issuance"} successfully`,
        );
        setSelectedAdmission(null);
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
      selector: (row) =>
        `${row.clients?.firstname || ""} ${row.clients?.surname || ""} ${row.clients?.othernames || ""}`,
      sortable: true,
    },
    {
      name: "Course Registered",
      selector: (row) =>
        `${row.payments?.courses?.course_id} - ${row.payments?.courses?.course_name}`,
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
            disabled={isDownloading}
            className="rounded bg-green-500 px-4 py-2 text-white"
            onClick={() => downloadCertificate(row)}
          >
            {isDownloading && activeTransaction === row.admission_number ? (
              <span>
                Downloading... <FontAwesomeIcon icon={faSpinner} spin />
              </span>
            ) : (
              <span>
                <FontAwesomeIcon icon={faDownload} />
                &nbsp; Download
              </span>
            )}
            {/* <FontAwesomeIcon icon={faDownload} /> Download Certificate */}
          </button>
          {/* &nbsp;
          <button
            disabled={isEmailing}
            className="rounded bg-green-500 px-4 py-2 text-white"
            onClick={() => emailCertificate(row)}
          >
            {isEmailing && activeTransaction === row.admission_number ? (
              <span>
                Sending... <FontAwesomeIcon icon={faSpinner} spin />
              </span>
            ) : (
              <span>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp; Email
              </span>
            )}
           
          </button> */}
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

  const downloadCertificate = async (row) => {
    const admissionNumber = row.admission_number;
    setIsDownloading(true);
    setActiveTransaction(admissionNumber);
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/client-certificate/download/${admissionNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `iLearnCertificate-${admissionNumber}.pdf`,
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.error(
          "Failed to download the admission letter",
          response.statusText,
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while downloading the admission letter",
        error,
      );
    }
    setIsDownloading(false);
  };

  const emailCertificate = async (row) => {
    const admissionNumber = row.admission_number;
    setIsEmailing(true);
    setActiveTransaction(admissionNumber);
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/client-certificate/email/${admissionNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        },
      );

      // if (response.ok) {
      //   const blob = await response.blob();
      //   const url = window.URL.createObjectURL(blob);
      //   const link = document.createElement("a");
      //   link.href = url;
      //   link.setAttribute("download", `iLearnCertificate-${admissionNumber}.pdf`);
      //   document.body.appendChild(link);
      //   link.click();
      //   link.parentNode.removeChild(link);
      // } else {
      //   console.error("Failed to download the admission letter", response.statusText);
      // }
    } catch (error) {
      console.error(
        "An error occurred while emailing the admission letter",
        error,
      );
    }
    setIsEmailing(false);
  };

  return (
    <div>
      <CSVLink data={filteredAdmissions} filename={"certificates.csv"}>
        <button className="mb-4 rounded bg-blue-500 px-4 py-2 text-white">
          Download CSV
        </button>
      </CSVLink>
      <DataTable
        columns={columns}
        data={filteredAdmissions}
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
            placeholder="Search Certificates"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-300 w-full rounded border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        }
        subHeaderAlign="right"
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
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={confirmReceipt}
                onChange={handleConfirmReceiptChange}
                className="mr-2"
                required
              />
              <label className="text-gray-700">
                By clicking this button, you confirm that this client is
                eligible to be issued this certificate under your authorization.
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={(event) => handleApproval(event, true)}
                disabled={isSubmitting}
                className={`mr-2 rounded bg-blue-500 px-4 py-2 text-white ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {isSubmitting ? (
                  <span>
                    Please wait...{" "}
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  </span>
                ) : (
                  "Issue Certificate"
                )}
              </button>
              <button
                style={{ background: "red" }}
                className="bg-red-500 rounded px-4 py-2 text-black"
                onClick={() => setSelectedAdmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCertificates;
