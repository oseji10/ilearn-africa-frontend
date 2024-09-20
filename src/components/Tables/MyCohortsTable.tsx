"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import { formatDate } from "../Date";


const MyCohortsTable = () => {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const modalRef = useRef(null);
  const router = useRouter();
  const [clientId, setClientId] = useState("=") ;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
  });

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
                "Content-Type": "application/json",
              },
            },
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setClientId(data.client_id);

          setFormData((prevState) => ({
            ...prevState,
            client_id: data.client_id,
            email: data.email,
          }));
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };

    fetchClientId();
  }, []);

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cohorts/active-cohorts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCohorts(response.data.cohorts);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  // const handleEyeClick = (cohort) => {
  //   // Navigate to the desired page with the cohort ID as a query parameter
  //   router.push(`/client-dashboard/my-registration/courses-after-payment`);
  // };

  const handleEyeClick = (cohort) => {
    localStorage.setItem('fromPreviousPage', 'true');
    // console.log(cohort.cohort_id); // Check if cohort_id is available
    // router.push(`/client-dashboard/my-registration/courses-after-payment?cohort_id=${cohort.cohort_id}`);
    router.push(`/client-dashboard/my-registration/payment-options?cohort_id=${cohort.cohort_id}`);
  };
  
  

  const closeModal = useCallback(() => {
    setSelectedCourse(null);
    setFile(null); // Reset the file when closing the modal
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    if (selectedCourse) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCourse, handleClickOutside]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file); // Store the file in the state
  };

  const handlePaymentUpdate = useCallback(
    async (event) => {
      event.preventDefault();
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);
      formData.append("course_id", selectedCourse.course_id);
  
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
  
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/proof-of-payment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
  
        if (response.ok) {
          setError(null);
          closeModal();
        } else {
          throw new Error("Payment submission failed");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsSubmitting(false);
        router.push('/client-dashboard/my-payments/successful-upload');
      }
    },
    [file, clientId, selectedCourse, closeModal, router]
  );




  

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
                {/* <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Course ID
                </th> */}
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Cohort Name
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Start Date
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
              {cohorts.map((cohort, key) => (
                <tr key={key}>
                  {/* <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {cohort.cohort_id}
                    </h5>
                  </td> */}
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {cohort.cohort_name}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {/* {cohort.start_date} */}
                      {formatDate(cohort.start_date)}
                    </p>
                  </td>
                
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        cohort.status === "inactive"
                          ? "bg-warning text-warning"
                          : cohort.status === "active"
                            ? "bg-success text-success"
                            : ""
                      }`}
                    >
                      {cohort.status === "active"
                        ? "Active"
                        : cohort.status === "inactive"
                          ? "Inactive"
                          : "N/A"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {cohort.status === "inactive"
                        ? <button
                        style={{background:'grey'}}
                        className="inline-flex items-center justify-center  px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        disabled
                      >SELECT
                      </button>
                        : cohort.status === "active"
                          ?  
                          

<button
className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
onClick={() => handleEyeClick(cohort)}
>SELECT
</button>

: "N/A"}
                     
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


  

     
    </div>
  );
};

export default MyCohortsTable;
