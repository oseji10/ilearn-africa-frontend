"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
// import Modal from 'react-modal';

const AdmittedClientsTable = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null); 

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admitted`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAdmissions(response.data.admissions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);



  const downloadLetter = async (admissionNumber) => {
    // console.log(admissionNumber);
    setIsDownloading(true);
    setActiveTransaction(admissionNumber);
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admissions/admission_letter?admission_number=${admissionNumber}`,
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
        setActiveTransaction(null);
      } else {
        console.error("Failed to download the admission letter", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the admission letter", error);
    }
    finally {
      setIsDownloading(false); // Hide spinner
    }
  };




  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Client ID
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Course Registered
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
              {admissions.map((admission, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {admission.client_id} 
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {admission.clients?.firstname} {admission.clients?.surname} {admission.clients?.othernames}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {admission.payments?.courses?.course_id} - {admission.payments?.courses?.course_name}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p 
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        admission.status === "ADMITTED"
                          ? "bg-success text-success"
                          : admission.status === "COMPLETED"
                          ? "bg-success text-success"
                          : admission.status === "pending"
                            ? "bg-danger text-danger"
                            : ""
                      }`}
                    >
                      {admission.status === "pending" ? "PENDING" : admission.status === "ADMITTED" ? "ADMITTED" : admission.status === "COMPLETED" ? "GRADUATED" : "N/A"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      
                    {admission.status === "COMPLETED" && (
                      <button
    disabled={isDownloading}
    className="px-4 py-2 bg-green-500 text-white rounded"
    onClick={(event) => downloadLetter(admission.admission_number)}
  >
    {isDownloading && activeTransaction === admission.admission_number ? (
      <span>
        Sending. Please wait... <FontAwesomeIcon icon={faSpinner} spin />
      </span>
    ) : (
      <span>
        {/* <FontAwesomeIcon icon={faEnvelope} /> */}
         Download/Email Admission
      </span>
    )}
  </button>
)}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            ref={modalRef}
          >
            <h2 className="text-lg font-medium mb-4">
              Admission Approval: {selectedAdmission.admission_number}
            </h2>
            <div className="space-y-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => handleApproval(true)}
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleApproval(false)}
              >
                Disapprove
              </button>
            </div>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
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
