"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import { TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const AdmissionsTable = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const modalRef = useRef(null);
  const [serverResponse, setResponse] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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
    const filteredData = admissions.filter(
      (admission) =>
        (admission.firstname?.toLowerCase() || "").includes(
          search.toLowerCase(),
        ) ||
        (admission.surname?.toLowerCase() || "").includes(
          search.toLowerCase(),
        ) ||
        (admission.othernames?.toLowerCase() || "").includes(
          search.toLowerCase(),
        ) ||
        (admission.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (admission.phone?.toLowerCase() || "").includes(search.toLowerCase()),
    );
    setFilteredAdmissions(filteredData);
  }, [search, admissions]);

  const handleEyeClick = useCallback((admission) => {
    setSelectedAdmission(admission);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedAdmission(null);
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

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedRows(isChecked ? admissions.map((row) => row.id) : []);
  };

 
  
  const handleBulkAction = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
      
      setIsSubmitting(true);
  
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admit-all`,
        {
          ids: selectedRows, // Array of selected admission IDs
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Selected admissions have been successfully updated to ADMITTED.");
  
        // Remove the admitted rows from the admissions state
        setAdmissions((prevAdmissions) =>
          prevAdmissions.filter((admission) => !selectedRows.includes(admission.id))
        );
        setFilteredAdmissions((prevFilteredAdmissions) =>
          prevFilteredAdmissions.filter((admission) => !selectedRows.includes(admission.id))
        );
  
        // Clear selected rows after successful update
        setSelectedRows([]);
      } else {
        alert("Failed to update selected admissions.");
      }
    } catch (err) {
      console.error(err.message);
      alert("An error occurred while updating admissions.");
    } finally {
      setIsSubmitting(false);
    }
  };
  


  const columns = [
    {
      name: <input type="checkbox" onChange={handleSelectAll}  />,
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
        />
      ),
      sortable: false,
      style:{ width: "1px", whiteSpace: "normal" },
    },
    // {
    //   name: "Client",
    //   selector: (row) => <p>{row.client_id || "N/A"}</p>,
    //   sortable: true,
    // },
    {
      name: "Name",
      selector: (row) =>
       <p style={{ width: "auto", whiteSpace: "normal" }}>{row.clients?.firstname || "N/A"} {row.clients?.surname || "N/A"} {row.clients?.othernames || "N/A"}</p>,
      sortable: true,
      wrap: true,
    },
    {
      name: "Course Applied",
      selector: (row) => (
        <p style={{ width: "auto", whiteSpace: "normal" }}>
          {row.payments?.courses?.course_id || "N/A"}{" - "}
          {row.payments?.courses?.course_name || "N/A"}
        </p>
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: "Payment Date",
      selector: (row) => (
       
        <p style={{ width: "100%" }}>{format(new Date(row.payments?.created_at), 'EEEE, MMMM do, yyyy') || "N/A"}</p>
        
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            row.status === "ADMITTED"
              ? "bg-success text-success"
              : row.status === "pending"
                ? "bg-warning text-warning"
                : ""
          }`}
        >
          {row.status === "ADMITTED"
            ? "Admitted"
            : row.status === "pending"
              ? "Pending"
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
            className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            onClick={() => handleApproval(row)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
            <>
                    Please wait... <FontAwesomeIcon icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                  </>
                  ) : (
                    "ADMIT"
                  )}
          </button>
        </div>
        
      ),
    },
  ];

  const handleApproval = async (row) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
      setIsSubmitting(true);
      const admissionNumber = row.admission_number;
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admissions/${admissionNumber}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "ADMITTED" }),
        }
      );
  
      if (response.ok) {
        const data = await response.json(); 
        setResponse(data.message);
        alert(data.message);
        
        // Remove the admitted row from the admissions state
        setAdmissions((prevAdmissions) =>
          prevAdmissions.filter((admission) => admission.admission_number !== admissionNumber)
        );
        setFilteredAdmissions((prevFilteredAdmissions) =>
          prevFilteredAdmissions.filter((admission) => admission.admission_number !== admissionNumber)
        );
        closeModal();
      } else {
        alert("There was an issue processing the admission");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
    setIsSubmitting(false);
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
        &nbsp; &nbsp;
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleBulkAction}
        >
          Admit Selected
        </button>
      </div>

      {/* <div className="mt-4">
      
      </div> */}

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
            <h2 className="mb-4 text-lg font-bold">Admission Details</h2>
            <p>
              <strong>Client ID:</strong> {selectedAdmission.client_id}
            </p>
            <p>
              <strong>Name:</strong> {selectedAdmission.clients?.firstname}{" "}
              {selectedAdmission.clients?.surname}
            </p>
            <p>
              <strong>Course Applied:</strong>{" "}
              {selectedAdmission.payments?.courses?.course_name}
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

export default AdmissionsTable;
