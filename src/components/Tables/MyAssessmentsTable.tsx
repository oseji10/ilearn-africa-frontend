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
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const MyAssessmentsTable = () => {
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
    examName: ""
  });
  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const router = useRouter();
  


  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeCBTModal = () => setCBTModalOpen(false);




  // Fetch data from /api/cbt-exams
  useEffect(() => {
    const fetchClientCohortAndExams = async () => {
      try {
        setLoading(true);
        const client_id = localStorage.getItem("client_id");
        if (!client_id) throw new Error("Client ID not found in local storage");

        const clientResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client-cohort/${client_id}`, {
          // params: { client_id },
        });

        setFilteredCourses(clientResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchClientCohortAndExams();
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
 

  const handleView = (row) => {
    const date = formatDate(row?.examDate); // Convert to "Sunday, 19th January, 2024"
    const time = formatTime(row?.examTime);
    Swal.fire({
      title: "Exam Details",
      html: `
        <p><strong>Exam Name:</strong> ${row?.examName}</p>
        <p><strong>Details:</strong> ${row?.details}</p>
        <p><strong>Course:</strong> ${row?.course?.course_name}</p>
        <p><strong>Cohort:</strong> ${row?.cohort?.cohort_name}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Number of questions:</strong> N/A</p>
      `,
      confirmButtonText: "Close",
    });
  };
  


  const handleEdit = (row) => {
    setCbtExams(row);
    setCBTModalOpen(true);
  };


  
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
  <DataTable
  columns={[
    { name: "Exam Name", selector: (row) => row?.examName, sortable: true },
    { name: "Course ID", selector: (row) => row?.courseId, sortable: true },
    { name: "Course Name", selector: (row) => row?.course?.course_name, sortable: true },
    {
      name: "Exam Date",
      selector: (row) => row.examDate,
      sortable: true,
      cell: (row) => (
        <span>
          {row.examDate} at {row.examTime}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
        className={`px-2 py-1 rounded text-white ${
          row.status.trim().toLowerCase() === "active" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {row.status}
      </span>
      
      ),
    },
    {
      name: "Actions",
      cell: (row) => {
        const examDateTime = new Date(`${row.examDate}T${row.examTime}`); // Combine date & time
        const now = new Date();
    
        return (
          <div className="flex space-x-2">
            {now >= examDateTime ? (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                onClick={() =>
                  router.push(
                    `/client-dashboard/my-assessments/instructions?examId=${row.examId}&examName=${row.examName}&details=${row.details}&timeAllowed=${row.timeAllowed}`
                  )
                }
              >
                <FontAwesomeIcon icon={faPencil} /> Take Exam
              </button>
            ) : (
              <span className="text-gray-500">Not yet available</span>
            )}
          </div>
        );
      },
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


{isCBTModalOpen && cbtExams && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add/Edit Exam</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="examName"
                placeholder="Exam Name"
                value={cbtExams.examName}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <textarea
                name="details"
                placeholder="Details"
                value={cbtExams.details}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                type="date"
                name="examDate"
                value={cbtExams.examDate}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                type="time"
                name="examTime"
                value={cbtExams.examTime}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <div className="flex flex-wrap gap-4">
                {["isShuffle", "isRandom", "canRetake", "canSeeResult"].map((field) => (
                  <label key={field}>
                    <input
                      type="checkbox"
                      name={field}
                      checked={cbtExams[field]}
                      onChange={handleInputChange2}
                      className="mr-2"
                    />
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                ))}
              </div>
              <select
                name="status"
                value={cbtExams.status}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                name="courseId"
                value={cbtExams.courseId}
                onChange={handleInputChange2}
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
                value={cbtExams.cohortId}
                onChange={handleInputChange2}
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
                onClick={handleSubmitEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={closeCBTModal}
                className="px-4 py-2 bg-red text-white rounded"
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

export default MyAssessmentsTable;
