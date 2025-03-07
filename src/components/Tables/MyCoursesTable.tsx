'use client'
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";

const MyCoursesTable = () => {
  const [my_courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/my-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data)
        setCourses(response.data.my_courses);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDownloadMaterialsClick = async (course_id) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/course_materials`, {
        params: { course_id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data)
      setCourseMaterials(response.data.course_materials);
      setSelectedCourse(course_id);
    } catch (error) {
      console.error("Error fetching course materials:", error);
    }
  };

  const closeModal = useCallback(() => {
    setSelectedCourse(null);
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
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white ">
                  Course ID
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Course Name
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Cohort
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Awarding Institution
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {my_courses.map((my_course, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark ">
                    <h5 className="font-medium text-black dark:text-white">
                      {my_course?.course_id}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {my_course?.courses?.course_name}
                    </p>
                  </td>


                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {my_course?.cohorts?.cohort_name}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {my_course?.courses?.centers?.center_name}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {/* <button
                        className="hover:text-primary"
                        onClick={() => handleDownloadMaterialsClick(my_course.course_id)}
                      >
                        Download Course Materials <FontAwesomeIcon icon={faDownload} />
                      </button> */}

{(my_course?.admissions?.status === "ADMITTED" || my_course?.admissions?.status === "COMPLETED") ? (
  <button className="hover:text-primary" 
          onClick={() => handleDownloadMaterialsClick(my_course?.course_id)}
  >
    Download Course Materials <FontAwesomeIcon icon={faDownload} />
  </button>
) : (
  <p>Course materials will appear here once payment is confirmed and admission is issued.</p>
)}





                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCourse && (
        <div className="modal fixed inset-0 flex items-center justify-center z-50">
          <div className="modal-overlay absolute inset-0 bg-gray-900 opacity-50"></div>
          <div
            ref={modalRef}
            className="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto"
          >
            <div className="modal-content py-4 text-left px-6">
              <div className="flex justify-between items-center pb-3">
                <p className="text-2xl font-bold">Course Materials</p>
                <div className="modal-close cursor-pointer z-50" onClick={closeModal}>
                  <svg className="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                    <path d="M14.53 4.53a.75.75 0 00-1.06-1.06L9 7.94 4.53 3.47a.75.75 0 10-1.06 1.06L7.94 9l-4.47 4.47a.75.75 0 101.06 1.06L9 10.06l4.47 4.47a.75.75 0 101.06-1.06L10.06 9l4.47-4.47z"/>
                  </svg>
                </div>
              </div>
              <div>
                <ul>
                  
                {
  courseMaterials.length > 0 ? (
    courseMaterials.map((material) => (
      <li type="1" key={material.course_id} className="p-2 border-b border-gray-200">
        <a
          href={`${process.env.NEXT_PUBLIC_DOWNLOAD_LINK}${material.material_link}`}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {material.material_name}<br/>
          {/* {`${process.env.NEXT_PUBLIC_DOWNLOAD_LINK}${material.material_link}`} */}
        </a>
      </li>
    ))
  ) : (
    <p>No materials available for this course.</p>
  )
}


                </ul>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  className="px-4 bg-gray-200 p-3 rounded-lg text-black hover:bg-gray-300"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesTable;
