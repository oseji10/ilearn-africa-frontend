"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faTrash, faFilePdf, faPen, faSpinner } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import { TextField } from "@mui/material";

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedClientDelete, setSelectedClientDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const modalRef = useRef(null);
  const modalRef2 = useRef(null);
  const modalRef3 = useRef(null);
  const [isEditClient, setIsEditClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState("");

  const [selectedClientDetails, setSelectedClientDetails] = useState({
    client_id: "",
    firstname: "",
    othernames: "",
    surname: "",
    lastname: "",
    email: "",
    phone_number: "",
    
  });

  

  // useEffect(() => {
  //   const fetchClients = async () => {
  //     // closeEditModal();
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         throw new Error("No auth token found");
  //       }

  //       const response = await axios.get(
  //         `${process.env.NEXT_PUBLIC_API_URL}/clients`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       // console.log(response.data.clients)
  //       setClients(response.data.clients);
  //       setSelectedClientDetails(response.data.clients)
  //       setFilteredClients(response.data.clients);
  //       setLoading(false);
  //     } catch (err) {
  //       setError(err.message);
  //       setLoading(false);
  //     }
  //   }
  // });
    // };
  // }
    // fetchClients();
  // }, []);


    // Fetch courses
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
        setFilteredClients(response.data.clients); // Set initial filtered courses
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchClients();
  }, []);


  // Move the deleteClient function outside of useEffect
const deleteClient = async (client) => {
  //  console.log("Client object:", client);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/delete_client/${client.client_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Filter out the deleted client from the list
    setClients(clients.filter((c) => c.client_id !== client.client_id));
    setFilteredClients(filteredClients.filter((c) => c.client_id !== client.client_id));
    setSelectedClientDelete(null); // Close the modal
  } catch (err) {
    setError(err.message);
  }
};


const handleClientUpdate = async () => {
  try {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/update_client/${selectedClientDetails.client_id}`,
      selectedClientDetails,  // Send the updated course data
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    fetchClients();  // Fetch the updated courses
    alert("Client details updated!");
    closeEditModal();  // Close the modal after update
  } catch (error) {
    console.error("Error updating client:", error);
  } finally {
    setIsSubmitting(false);
  }
};


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


   const handleClientDelete = useCallback((client) => {
    setSelectedClientDelete(client);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedClient(null);
  }, []);

  const closeModal2 = useCallback(() => {
    setSelectedClientDelete(null);
  }, []);


  const openEditModal = (row) => {
    setSelectedClientDetails(row);  // Set the selected course for editing
    setIsEditClient(true);
  };

  const closeEditModal = useCallback(() => {
    setIsEditClient(false);
  }, []);

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
        closeModal2();
        closeEditModal();
      }
    },
    [closeModal, closeEditModal]
  );

  const handleClickOutside2 = useCallback(
    (event) => {
      if (modalRef3.current && !modalRef3.current.contains(event.target)) {
       closeEditModal();
      }
    },
    [closeEditModal]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedClientDetails({
      ...selectedClientDetails,
      [name]: value,
    });
  };

  useEffect(() => {
    if (selectedClient || selectedClientDelete ) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedClient, selectedClientDelete, handleClickOutside]);



  useEffect(() => {
    if (selectedClientDetails) {
      document.addEventListener("mousedown", handleClickOutside2);
    } else {
      document.removeEventListener("mousedown", handleClickOutside2);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside2);
    };
  }, [selectedClientDetails, handleClickOutside2]);



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
        `${row.firstname || ""} ${row.surname || ""} ${row.othernames || ""}`,
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
            <FontAwesomeIcon icon={faEye} className="fill-current" size="sm" /> View 
          </button>

          <button className="hover:text-primary" onClick={() => openEditModal(row)}>
            <FontAwesomeIcon icon={faPen} className="fill-current" size="sm" /> Edit
          </button>
          
          {/* Conditionally render the delete button if user role is 3 */}
          {row.user.role_id !== 1 && (
            <button className="hover:text-primary" onClick={() => handleClientDelete(row)}>
              <FontAwesomeIcon icon={faTrash} className="fill-current" size="sm" /> Delete
            </button>
          )}
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
                {/* <tr>
                  <td width={"25%"}><strong>Client ID:</strong></td>
                  <td>{selectedClient.client_id}</td>
                </tr> */}

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









{selectedClientDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            ref={modalRef2}
          >
            <h2 className="text-xl font-semibold mb-4">Delete Client?</h2>
            {/* <h2 className="text-xl font-semibold mb-4">Hh{selectedClientDelete.user.client_id}</h2> */}
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this client?</h3>

<button
style={{background: 'red'}}
  className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
  onClick={() => deleteClient(selectedClientDelete)} // Corrected this line
>
  Delete
</button> 
&nbsp;&nbsp;
<button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={closeModal2}
            >
              Close
            </button>
          </div>
        </div>
      )}




{isEditClient && selectedClientDetails && (
        <div
        ref={modalRef3}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
            <h3 className="font-bold text-lg">Edit Client</h3>
            <input
              type="text"
              name="firstname"
              placeholder="Firstname"
              value={selectedClientDetails.firstname}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />
            <input
              type="text"
              name="othernames"
              placeholder="Othernames"
              value={selectedClientDetails.othernames}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />

<input
              type="text"
              name="surname"
              placeholder="Surname"
              value={selectedClientDetails.surname}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />

            <input
              type="number"
              name="phone_number"
              placeholder="Phone"
              value={selectedClientDetails.user?.phone_number}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />
         
         <input
              type="text"
              name="email"
              placeholder="Email"
              value={selectedClientDetails.user?.email}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />

            <div className="modal-action mt-4 flex justify-end">
              <button
                className="mt-4 px-4 py-2 text-black rounded"
                onClick={closeEditModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleClientUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};





export default ClientsTable;
