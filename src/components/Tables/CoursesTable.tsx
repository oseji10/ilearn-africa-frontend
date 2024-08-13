"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons/faFilePdf";
import { useRouter } from 'next/navigation';

const CoursesTable = () => {
  const [course_lists, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const modalRef = useRef(null);
  const router = useRouter();

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
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/course_list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCourses(response.data.courses);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEyeClick = (courses) => {
    setSelectedCourse(courses);
  };

  const closeModal = () => {
    setSelectedCourse(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCourse]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }



  const handlePayment = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PAYSTACK_URL}`, // Ensure this endpoint is correct
        {
          // course_id: selectedCourse.course_id,
          email: formData.email,
          amount: selectedCourse.cost * 100, // Paystack expects amount in kobo (smallest currency unit)
          callback_url: `${process.env.NEXT_PUBLIC_PAYSTACK_VERIFY_FRONETEND}/verify?course_id=${encodeURIComponent(selectedCourse.course_id)}`, // The callback URL
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.status) {
        window.location.href = response.data.data.authorization_url;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
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
                  Course ID
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Course Name
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
              {course_lists.map((course_list, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {course_list.course_id}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {course_list.course_name}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {Number(course_list.cost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        course_list.status === 1
                          ? "bg-success text-success"
                          : course_list.status === 0
                            ? "bg-warning text-warning"
                            : ""
                      }`}
                    >
                      {course_list.status === 1
                        ? "Active"
                        : course_list.status === 0
                          ? "Disabled"
                          : "N/A"}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleEyeClick(course_list)}
                      >
                        <FontAwesomeIcon
                          icon={faEye}
                          className="fill-current"
                          size="sm"
                        />
                      </button>
                      <button className="hover:text-primary">
                        <FontAwesomeIcon
                          icon={faFilePdf}
                          className="fill-current"
                          size="sm"
                        />
                      </button>
                      <button className="hover:text-primary">
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="fill-current"
                          size="sm"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-1/2 bg-white rounded shadow-lg p-6 relative"
            ref={modalRef}
          >
            <h2 className="text-lg font-semibold mb-4">Course Details</h2>
            <p>
              <strong>Course Name:</strong> {selectedCourse.course_name}
            </p>
            <p>
              <strong>Cost:</strong> NGN{" "}
              {Number(selectedCourse.cost).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <button
              onClick={handlePayment}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Pay for Course
            </button>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesTable;