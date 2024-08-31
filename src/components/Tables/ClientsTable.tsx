"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faTrash, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import { TextField } from "@mui/material";

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/clients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClients(response.data.clients);
        setFilteredClients(response.data.clients);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const filteredData = clients.filter(
      (client) =>
        (client.firstname?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (client.surname?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (client.othernames?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (client.user?.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (client.user?.phone_number?.toLowerCase() || "").includes(search.toLowerCase())
    );
    setFilteredClients(filteredData);
  }, [search, clients]);
  

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
    [closeModal]
  );

  useEffect(() => {
    if (selectedClient) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedClient, handleClickOutside]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const columns = [
    {
      name: "Name",
      selector: (row) =>
        `${row.firstname} ${row.surname} ${row.othernames}`,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.user?.email || "N/A",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.user?.phone_number || "N/A",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            row.status === "admitted"
              ? "bg-success text-success"
              : row.status === "profile_created"
              ? "bg-danger text-danger"
              : row.status === "registered"
              ? "bg-warning text-warning"
              : row.status === "pending"
              ? "bg-warning text-warning"
              : ""
          }`}
        >
          {row.status === "profile_created"
            ? "Profile Created"
            : row.status === "registered"
            ? "Registered"
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
          <button className="hover:text-primary" onClick={() => handleEyeClick(row)}>
            <FontAwesomeIcon icon={faEye} className="fill-current" size="sm" /> View Client
          </button>
          {/* <button className="hover:text-primary">
            <FontAwesomeIcon icon={faFilePdf} className="fill-current" size="sm" />
          </button>
          <button className="hover:text-primary">
            <FontAwesomeIcon icon={faTrash} className="fill-current" size="sm" />
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-4">
          <TextField
            id="search"
            label="Search"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-w-full overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredClients}
            pagination
            highlightOnHover
            striped
            persistTableHead
          />
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            ref={modalRef}
          >
            <h2 className="text-xl font-semibold mb-4">CLIENT DETAILS</h2>
            <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
            <hr />
            <br />
            <table width={"100%"}>
              <tbody>
                <tr>
                  <td width={"25%"}><strong>Client ID:</strong></td>
                  <td>{selectedClient.client_id}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Name:</strong></td>
                  <td>{selectedClient.firstname} {selectedClient.lastname} {selectedClient.othernames}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Email:</strong></td>
                  <td>{selectedClient.user?.email}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Phone Number:</strong></td>
                  <td>{selectedClient.user?.phone_number}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Gender:</strong></td>
                  <td>{selectedClient.gender}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Marital Status:</strong></td>
                  <td>{selectedClient.marital_status}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Address:</strong></td>
                  <td>{selectedClient.address}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Country:</strong></td>
                  <td>{selectedClient.country?.country_name}</td>
                </tr>

                <tr>
                  <td width={"15%"}><strong>Nationality:</strong></td>
                  <td>{selectedClient.nationality?.nationality}</td>
                </tr>
              </tbody>
            </table>

            <br />
            <h3 className="text-xl font-semibold mb-4">Educational Details</h3>
            <hr />
            <table width={"100%"}>
              <thead>
                <tr align="left">
                  <th width={"30%"}>Qualification</th>
                  <th width={"30%"}>Course</th>
                  <th width={"30%"}>Grade</th>
                  <th width={"40%"}>Date Acquired</th>
                </tr>
              </thead>
              <tbody>
                {selectedClient.educational_details &&
                  selectedClient.educational_details.length > 0 && (
                    <>
                      {selectedClient.educational_details.map((detail, index) => (
                        <tr key={index}>
                          <td>{detail.qualification?.qualification_name || "N/A"}</td>
                          <td>{detail.course_studied}</td>
                          <td>{detail.grade?.grade}</td>
                          <td>{detail?.date_acquired}</td>
                        </tr>
                      ))}
                    </>
                  )}
              </tbody>
            </table>


            <br />
            <h3 className="text-xl font-semibold mb-4">Work Details</h3>
            <hr />
            <table width={"100%"}>
              <thead>
                <tr align="left">
                  <th width={"30%"}>Organization</th>
                  <th width={"30%"}>Job Title</th>
                  <th width={"30%"}>Start Date</th>
                  <th width={"40%"}>End Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedClient.work_details &&
                  selectedClient.work_details.length > 0 && (
                    <>
                      {selectedClient.work_details.map((detail, index) => (
                        <tr key={index}>
                          <td>{detail.organization || "N/A"}</td>
                          <td>{detail.job_title}</td>
                          <td>{detail.start_date}</td>
                          <td>{detail?.end_date}</td>
                        </tr>
                      ))}
          <a style={{color: 'blue'}} target="_blank" href={`${process.env.NEXT_PUBLIC_DOWNLOAD_LINK}${selectedClient?.documents?.file_path}`}>Click to View Uploaded Document</a>

                    </>
                  )}
              </tbody>
            </table>

            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
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

export default ClientsTable;
