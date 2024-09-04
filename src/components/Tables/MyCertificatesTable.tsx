"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

const MyCertificatesTable = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [confirmReceipt, setConfirmReceipt] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [clientId, setClientId] = useState("");

  const [formData, setFormData] = useState({
    client_id: "",
    admission_number: ""
  });

  const handleConfirmReceiptChange = useCallback((e) => {
    setConfirmReceipt(e.target.checked);
  }, []);

  useEffect(() => {
    const fetchClientId = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client-id`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setClientId(data.client_id);
          setFormData((prevState) => ({
            ...prevState,
            client_id: data.client_id,
            admission_number: data.admission_number
          }));
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };
    fetchClientId();
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!clientId) return; // Ensure clientId is not blank before making the API call
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/certificates/my-certificates/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log(response.data);
        setCertificates(response.data.certificates);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [clientId]);

  const closeModal = () => {
    setSelectedAdmission(null);
  };

  const handleApproval = async (event, certificate) => {
    event.preventDefault();
    setIsSubmitting(true);
    const approvalData = {
      admission_number: certificate.admission_number
    };

    // if (!confirmReceipt) {
    //   alert("You must confirm receipt of the payment.");
    //   setIsSubmitting(false);
    //   return;
    // }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(approvalData)
        }
      );

      if (response.ok) {
        alert("Certificate sent successfully");
        closeModal();
      } else {
        setError("There was an error emailing the certificate");
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
                  Admission Number
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Course Studied
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
              {certificates.map((certificate, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {/* {certificate.client_id} */}
                      iLA/{String(certificate?.id).padStart(4, '0')}/2024
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {certificate.clients?.firstname}{" "}
                      {certificate.clients?.surname}{" "}
                      {certificate.clients?.othernames}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {certificate.payments.courses?.course_id} -{" "}
                      {certificate.payments.courses?.course_name}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        certificate.status === "COMPLETED"
                          ? "bg-success text-success"
                          : certificate.status === "ADMITTED"
                          ? "bg-danger text-danger"
                          : ""
                      }`}
                    >
                      {certificate.status === "ADMITTED"
                        ? "NOT ISSUED"
                        : certificate.status === "COMPLETED"
                        ? "ISSUED"
                        : "N/A"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                    <button
  disabled={isSubmitting}
  className="px-4 py-2 bg-green-500 text-white rounded"
  onClick={(event) => handleApproval(event, certificate)}
>
  {isSubmitting ? (
    <span>
      Sending. Please wait... <FontAwesomeIcon icon={faSpinner} spin />
    </span>
  ) : (
    <span>
      <FontAwesomeIcon icon={faEnvelope} /> Email Certificate
    </span>
  )}
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
        <div
          id="approvalModal"
          tabIndex="-1"
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        >
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Email Certificate</h2>
              <form>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="confirmReceipt"
                    checked={confirmReceipt}
                    onChange={handleConfirmReceiptChange}
                  />
                  <label htmlFor="confirmReceipt">
                    Confirm receipt of the payment
                  </label>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={(event) => handleApproval(event, selectedAdmission)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    {isSubmitting ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCertificatesTable;
