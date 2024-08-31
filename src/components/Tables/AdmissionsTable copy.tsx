"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

const AdmissionsTable = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [admissionNumber, setAdmissionNumber] = useState("");
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(response.data.admissions[0].admission_number)

        setAdmissions(response.data.admissions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  const handleEyeClick = (admission) => {
    setSelectedAdmission(admission);
  };

  const handleAdmissionNumberChange = useCallback((e) => {
    setAdmissionNumber(e.target.value);
  }, []);

  const closeModal = () => {
    setSelectedAdmission(null);
  };

  const modalRef = useRef();

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, []);

  useEffect(() => {
    if (selectedAdmission) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedAdmission, handleClickOutside]);




  const handleApproval = async (approved) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }
  
      // const admissionNumber = selectedAdmission.admission_number;
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admissions/${selectedAdmission.admission_number}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   admissionNumber,
        //   approved,
        // }),
      });
  
      if (response.ok) {
        alert(`Admission ${approved ? 'approved' : 'disapproved'} successfully`);
        closeModal();
      } else {
        alert('There was an issue processing the admission');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };
  
  const handleDownloadClick = (event) => {
    const button = event.currentTarget;
    const admissionNumber = button.dataset.admissionNumber;
    downloadLetter(admissionNumber);
  };
  const downloadLetter = async (admissionNumber) => {
 
    console.log(admissionNumber)
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
      } else {
        console.error("Failed to download the admission letter", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading the admission letter", error);
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
                  {/* <input type='text' value={admission.admission_number} id='admission_number' /> */}
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
                          : admission.status === "pending"
                            ? "bg-danger text-danger"
                            : ""
                      }`}
                    >
                      {admission.status === "pending" ? "PENDING" : admission.status === "ADMITTED" ? "ADMITTED" : "N/A"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button className="hover:text-primary" onClick={() => handleEyeClick(admission)}>
                        <FontAwesomeIcon icon={faEye} className="fill-current" size="sm" />
                      </button>
                    

                      

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
            <h2 className="text-xl font-semibold mb-4">ADMISSIONS APPROVAL</h2>
            {/* <h3 className="text-xl font-semibold mb-4">Personal Details</h3> */}
            <hr/><br/>
            <table width={"100%"}>
              <tbody>
                <tr>
                  <td width={"25%"}><strong>Client ID:</strong></td>
                  <td>{selectedAdmission.client_id}</td>
                </tr>
                <tr>
                  <td width={"15%"}><strong>Name:</strong></td>
                  <td>{selectedAdmission.clients?.firstname} {selectedAdmission.clients?.surname} {selectedAdmission?.clients.othernames}</td>
                </tr>
                <tr>
                  <td width={"15%"}><strong>Email:</strong></td>
                  <td>{selectedAdmission.clients.user?.email}</td>
                </tr>
                <tr>
                  <td width={"15%"}><strong>Phone Number:</strong></td>
                  <td>{selectedAdmission.clients.user?.phone_number}</td>
                </tr>
                <tr>
                  <td width={"15%"}><strong>Gender:</strong></td>
                  <td>{selectedAdmission.clients?.gender}</td>
                </tr>
              </tbody>
            </table>
          {/* <p>Hh{selectedAdmission?.admission_number}</p> */}
            <form>
  <button
    type="button"
    className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
    onClick={() => handleApproval(true)}
  >
    Approve
  </button> &nbsp;
  {/* <button
    type="button"
    className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
    onClick={() => handleApproval(false)}
    style={{backgroundColor:"red", color:"white"}}
  >
    Disapprove
  </button> */}
</form>

          <span style={{alignItems:"center"}}>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={closeModal}>Close</button>
          </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsTable;









