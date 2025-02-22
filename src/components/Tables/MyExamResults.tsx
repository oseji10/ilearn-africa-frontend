"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faPlus,
  faSpinner,
  faTrash,
  faFilePdf,
  faEdit,
  faArrowAltCircleLeft,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const MyExamResults = () => {
  // const [courseLists, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCBTModalOpen, setCBTModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    details: "",
    examDate: "",
    examTime: "",
    isShuffle: false,
    isRandom: false,
    canRetake: false,
    canSeeResult: false,
    status: "",
    courseId: "",
    cohortId: "",
    examName: "",
    timeAllowed: ""
  });
  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const router = useRouter();
  // Fetch courses and cohorts
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [coursesResponse, cohortsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/course_list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cohorts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesResponse.data.courses);
        setCohorts(cohortsResponse.data.cohorts);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInputChange2 = (e) => {
    const { name, value, type, checked } = e.target;
    setCbtExams((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeCBTModal = () => setCBTModalOpen(false);

  
  // Fetch data from /api/cbt-exams
  const [cbtExams, setCbtExams] = useState([]);
  useEffect(() => {
    const fetchCbtExams = async () => {
      const client_id = localStorage.getItem("client_id");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-cbt-exam-results/${client_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCbtExams(response.data); // Update based on the actual response structure
        setFilteredCourses(response.data); // To handle filtering later
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CBT exam results:", error);
        setLoading(false);
      }
    };

    fetchCbtExams();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not Available"; // Handle null or undefined time
    }
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    const day = date.getDate();
    const ordinal =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
        ? 'rd'
        : 'th';
  
    return date.toLocaleDateString('en-US', options).replace(/\d{1,2}/, `${day}${ordinal}`);
  };
  
  const formatTime = (timeString) => {
    if (!timeString) {
      return "Not Available"; // Handle null or undefined time
    }
  
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
  
    return `${formattedHour}:${minutes}${period}`;
  };
  
  
  // Usage
 


  
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
               {/* <button
          className="px-4 py-2 bg-green-500 text-white rounded shadow"
          onClick={openModal}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Exam
        </button> */}
<span></span>


        <a href="/client-dashboard/my-assessments"><button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          
        >
          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To Dashboard
        </button></a>
      </div>

      <DataTable
  columns={[
    { name: "Exam Name", selector: (row) => row?.exam?.examName, sortable: true },
    // { name: "Course Id", selector: (row) => row?.courseId, sortable: true },
    // { name: "Course Name", selector: (row) => row?.course?.course_name, sortable: true },
    { name: "Exam Date", selector: (row) => row?.exam?.examDate, sortable: true },
    { name: "Score", selector: (row) => row?.total_score, sortable: true },
    // {
    //   name: "Status",
    //   selector: (row) => row.status,
    //   sortable: true,
    //   cell: (row) => (
    //     <span
    //       className={`px-2 py-1 rounded text-white ${
    //         row.status === "active" ? "bg-green-500" : "bg-red-500"
    //       }`}
    //     >
    //       {row.status}
    //     </span>
    //   ),
    // },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleView(row)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            className="text-green-500 hover:text-green-700"
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button> */}
          <a
            href={`/assessments/assessment-results/details`}
            className="text-blue-500 hover:text-green-700"
          >
            <FontAwesomeIcon icon={faEye} />
          </a>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ]}
  data={filteredCourses}
  pagination
  highlightOnHover
/>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Exam</h2>
            <div className="space-y-4">
            <input
                type="text"
                name="examName"
                placeholder="Exam Name"
                value={formData.examName}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />

              <textarea
                name="details"
                placeholder="Details"
                value={formData.details}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                type="time"
                name="examTime"
                value={formData.examTime}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />

<input
                type="number"
                name="timeAllowed"
                value={formData.timeAllowed}
                onChange={handleInputChange}
                placeholder="Time Allowed in Minutes e.g. (60 mins is 1hr)"
                className="border border-gray-300 rounded w-full px-4 py-2"
              />

              <div className="flex items-center space-x-2">
                <label>
                  <input
                    type="checkbox"
                    name="isShuffle"
                    checked={formData.isShuffle}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Shuffle Questions
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="isRandom"
                    checked={formData.isRandom}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Randomize Answers
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canRetake"
                    checked={formData.canRetake}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Allow Retake
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canSeeResult"
                    checked={formData.canSeeResult}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Can See Result
                </label>
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
              <select
                name="cohortId"
                value={formData.cohortId}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Cohort</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.cohort_id} value={cohort.cohort_id}>
                    {cohort.cohort_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Create
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-500 text-white rounded"
                style={{color: 'red'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyExamResults;
