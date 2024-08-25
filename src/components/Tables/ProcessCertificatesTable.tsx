"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { useRouter } from "next/navigation";

const ProcessCertificatesTable = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [confirmReceipt, setConfirmReceipt] = useState(false);
const [error, setError] = useState(null);
const router = useRouter();

  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
  }, []);


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
      // return;
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
            mode: "cors",
          },
          body: JSON.stringify(approvalData), // Pass the approval status
        }
      );
  
      if (response.ok) {
        alert(
          `This certicate has been ${approved ? "issued" : "disapproved for issuance"} successfully`
        );
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


  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}

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
                      {admission.clients?.firstname}{" "}
                      {admission.clients?.surname}{" "}
                      {admission.clients?.othernames}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {admission.payments?.courses?.course_id} -{" "}
                      {admission.payments?.courses?.course_name}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        admission.status === "COMPLETED"
                          ? "bg-success text-success"
                          : admission.status === "ADMITTED"
                          ? "bg-danger text-danger"
                          : ""
                      }`}
                    >
                      {admission.status === "ADMITTED"
                        ? "NOT ISSUED"
                        : admission.status === "COMPLETED"
                        ? "ISSUED"
                        : "N/A"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded"
                        onClick={() => handleEyeClick(admission)}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </button>
                      {/* {renderDownloadButton(admission)} */}
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
                <label className="text-gray-700">By clicking this button, you confirm that this client is eligible to be issued this certificate under your authorization.</label>
              </div>
      
            <button
            // type="submit"
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
              style={{background: 'grey'}}
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
