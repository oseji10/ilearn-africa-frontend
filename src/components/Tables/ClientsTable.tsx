"use client";
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token'); // Replace with the key used for your token
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(response.data.clients);
        console.log(response.data.clients)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleEyeClick = (client) => {
    setSelectedClient(client);
  };

  const closeModal = () => {
    setSelectedClient(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedClient) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedClient]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Email
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Phone
                </th>

                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>

                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {client.firstname} {client.surname} {client.othernames}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {client.user?.email}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {client.user?.phone_number}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p 
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                      client.status === "admitted"
                        ? "bg-success text-success"
                        : client.status === "profile_created"
                          ? "bg-danger text-danger"
                          : client.status === "registered" ? 
                          "bg-warning text-warning"
                          : ""
                    }`}
                    
                    >
                      {client.status === "profile_created" ? "Profile Created" : client.status === "registered" ? "Registered" : "N/A"}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button className="hover:text-primary" onClick={() => handleEyeClick(client)}>
                        <FontAwesomeIcon icon={faEye} className="fill-current" size="sm" />
                      </button>
                      <button className="hover:text-primary">
                        <FontAwesomeIcon icon={faFilePdf} className="fill-current" size="sm" />
                      </button>
                      <button className="hover:text-primary">
                        <FontAwesomeIcon icon={faTrash} className="fill-current" size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <hr/><br/>
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

              {/* <tr>
                <td width={"15%"}><strong>Current Status:</strong></td>
                <td>{selectedClient.status}</td>
              </tr> */}
              </tbody>
            </table>

            <br/>
            <h3 className="text-xl font-semibold mb-4">Educational Details</h3>
            <hr/>
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
  {selectedClient.educational_details && selectedClient.educational_details.length > 0 && (
    <>
      {selectedClient.educational_details.map((detail, index) => (
        <tr key={index}>
          {/* Fetch qualification_name from the main qualification object */}
          <td>{detail.qualification?.qualification_name || "N/A"}</td>
          <td>{detail?.course_studied}</td>
          <td>{detail.grade?.grade}</td>
          <td>{detail?.date_acquired}</td>
        </tr>
      ))}
    </>
  )}
</tbody>

            </table>


            <br/>
            <h3 className="text-xl font-semibold mb-4">Work Details</h3>
            <hr/>
            <table width={"100%"}>
              <thead>
                <tr align="left">
                  <th width={"30%"}>Organization</th>
                  <th width={"30%"}>Job title</th>
                  <th width={"30%"}>Start Date</th>
                  <th width={"40%"}>End Date</th>
                </tr>
              </thead>
              <tbody>
  {selectedClient.work_details && selectedClient.work_details.length > 0 && (
    <>
      {selectedClient.work_details.map((work_detail, index) => (
        <tr key={index}>
          {/* Fetch qualification_name from the main qualification object */}
          <td>{work_detail?.organization || "N/A"}</td>
          <td>{work_detail?.job_title}</td>
          <td>{work_detail?.start_date}</td>
          <td>{work_detail?.end_date}</td>
        </tr>
      ))}
    </>
  )}
</tbody>

            </table>

            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsTable;
