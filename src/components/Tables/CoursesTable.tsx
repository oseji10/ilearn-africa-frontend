"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPlus, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons/faFilePdf";
import { useRouter } from 'next/navigation';

const CoursesTable = () => {
  const [course_lists, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [centerList, setCenterList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState({
    course_id: "",
    course_name: "",
    cost: "",
    center_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  // Fetch center names from API
  useEffect(() => {
    const fetchCenters = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/centers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        setCenterList(response.data.centers); // assuming the response is an array of centers
      } catch (error) {
        console.error("Error fetching centers:", error);
      }
    };

    fetchCenters();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCourse((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Fetch courses
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseUpload = async () => {
    try {
      setIsSubmitting(true);
      // Add your form submission logic here
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/course_list`, // Endpoint with client_id
        {
          ...selectedCourse, // Spread formData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      fetchCourses(); // Fetch courses again to update the table after submission
      // Simulate a delay to show the spinner
      setTimeout(() => {
        alert("Course details submitted!");
        closeModal();
        // Reset the form
      setSelectedCourse({
        course_id: "",
        course_name: "",
        cost: "",
        center_id: "",
      });
      }, 5000);
    } catch (error) {
      console.error("Error uploading course:", error);
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <button
        className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8"
        onClick={openModal}
      >
        <FontAwesomeIcon icon={faPlus} />&nbsp;Upload Course
      </button>
      <br/><br/>
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
                  Cost
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
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
                      NGN{Number(course_list.cost).toLocaleString(undefined, {
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-1/2 bg-white rounded shadow-lg p-6 relative"
            ref={modalRef}
          >
            <h2 className="text-lg font-semibold mb-4">Course Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Course ID:
              </label>
              <input
                type="text"
                name="course_id"
                value={selectedCourse.course_id}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Course Name:
              </label>
              <input
                type="text"
                name="course_name"
                value={selectedCourse.course_name}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Center Name:
              </label>
              <select
                name="center_id"
                value={selectedCourse.center_id}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a Center</option>
                {centerList.map((center) => (
                  <option key={center.center_id} value={center.center_id}>
                    {center.center_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Cost:
              </label>
              <input
                type="number"
                name="cost"
                value={selectedCourse.cost}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <button
              onClick={handleCourseUpload}
              className="bg-primary text-white p-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>

            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
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
