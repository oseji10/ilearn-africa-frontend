"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import { TextField } from "@mui/material";
import { useRouter } from "next/navigation";

const AdmittedClientsTable = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const modalRef = useRef(null);
  const router = useRouter();
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
  
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admitted-clients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Log response to check structure
        console.log(response.data);
        
        setAdmissions(response.data.admissions); // Adjust this based on API response structure
        setFilteredAdmissions(response.data.admissions); // Adjust this based on API response structure
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchAdmissions();
  }, []);
  
  useEffect(() => {
    const filteredData = admissions.filter(
      (admission) =>
        (admission.clients?.firstname?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (admission.clients?.surname?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (admission.clients?.othernames?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (admission.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (admission.phone_number?.toLowerCase() || "").includes(search.toLowerCase()),
    );
    setFilteredAdmissions(filteredData);
  }, [search, admissions]);

  const handleEyeClick = useCallback((client) => {
    setSelectedClient(client);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedClient(null);
  }, []);

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    },
    [closeModal],
  );

  useEffect(() => {
    if (selectedAdmission) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedAdmission, handleClickOutside]);

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };



  const columns = [
    
    // {
    //   name: "Client ID",
    //   selector: (row) => <p>{row.client_id || "N/A"}</p>,
    //   sortable: true,
    // },
    {
      name: "Name",
      selector: (row) =>
        `${row.clients?.firstname || "N/A"} ${row.clients?.surname || "N/A"} ${row.clients?.othernames || "N/A"}`,
      sortable: true,
    },
    {
      name: "Course Applied",
      selector: (row) => <p>{row.payments?.courses?.course_id || "N/A"} - {row.payments?.courses?.course_name || "N/A"}</p>,
      sortable: true,
    },
    {
      name: "Admission Number",
      selector: (row) => <p>{`iLA/${String(row.id).padStart(4, '0')}/2024` || "N/A"}</p>,

      // iLA/{String(admission?.id).padStart(4, '0')}/2024
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p 
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        row.status === "ADMITTED"
                          ? "bg-success text-success"
                          : row.status === "COMPLETED"
                          ? "bg-success text-success"
                          : row.status === "pending"
                            ? "bg-danger text-danger"
                            : ""
                      }`}
                    >
                      {row.status === "pending" ? "PENDING" : row.status === "ADMITTED" ? "ADMITTED" : row.status === "COMPLETED" ? "GRADUATED" : "N/A"}
                    </p>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
        <div className="">
           {(row.status === "ADMITTED" || row.status === "COMPLETED") &&  (
                      <button
    disabled={isDownloading}
    className="px-4 py-2 bg-green-500 text-white rounded"
    // onClick={(event) => downloadLetter(row.admission_number)}
    onClick={() => downloadLetter(row)}
  >
    {isDownloading && activeTransaction === row.admission_number ? (
      <span>
        Please wait... <FontAwesomeIcon icon={faSpinner} spin />
      </span>
    ) : (
      <span>
        {/* <FontAwesomeIcon icon={faEnvelope} /> */}
         Download
      </span>
    )}
  </button>
)}
       
       
&nbsp;
{(row.status === "ADMITTED" || row.status === "COMPLETED") &&  (
  
                      <button
    disabled={isDownloading}
    className="px-4 py-2 bg-green-500 text-white rounded"
    // onClick={(event) => downloadLetter(row.admission_number)}
    onClick={() => emailLetter(row)}
  >
    {isEmailing && activeTransaction === row.admission_number ? (
      <span>
        Please wait... <FontAwesomeIcon icon={faSpinner} spin />
      </span>
    ) : (
      <span>
        {/* <FontAwesomeIcon icon={faEnvelope} /> */}
         Email
      </span>
    )}
  </button>
)}
        </div>
</>

      ),
    },
  ];

  const downloadLetter = async (row) => {
    const admissionNumber = row.admission_number;
  
    // Set the active transaction to the current row's admission number
    setActiveTransaction(admissionNumber);
    setIsDownloading(true);
  
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admissions/admission_letter/download?admission_number=${admissionNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `admission_letter-${admissionNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.error("Failed to download the admission letter", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the admission letter", error);
    } finally {
      setIsDownloading(false);
      setActiveTransaction(null); // Reset the active transaction after download
    }
  };
  
  const emailLetter = async (row) => {
    const admissionNumber = row.admission_number;
  
    // Set the active transaction to the current row's admission number
    setActiveTransaction(admissionNumber);
    setIsEmailing(true);
  
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admissions/admission_letter/email?admission_number=${admissionNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        alert("Admission letter successfully emailed!");
      } else {
        console.error("Failed to email the admission letter", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while emailing the admission letter", error);
    } finally {
      setIsDownloading(false);
      setActiveTransaction(null); // Reset the active transaction after emailing
    }
  };
  

  return (
    <div>
      <div className="mb-4 flex items-center">
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* &nbsp; &nbsp;
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleBulkAction}
        >
          Admit Selected
        </button> */}
      </div>

      <DataTable
        columns={columns}
        data={filteredAdmissions}
        progressPending={loading}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 50, 100]}
      />

      {selectedAdmission && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Client Details</h2>
            <p>
              <strong>Client ID:</strong> {selectedAdmission.client_id}
            </p>
            <p>
              <strong>Name:</strong> {selectedAdmission.firstname}{" "}
              {selectedAdmission.surname}
            </p>
            <p>
              <strong>Email:</strong> {selectedAdmission.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedAdmission.phone}
            </p>
            <p>
              <strong>Status:</strong> {selectedAdmission.status}
            </p>
            <button
              className="bg-red-500 hover:bg-red-600 mt-4 rounded px-4 py-2 text-white"
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

export default AdmittedClientsTable;
