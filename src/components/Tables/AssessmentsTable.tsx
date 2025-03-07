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

const AssessmentsTable = () => {
  // const [courseLists, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCBTModalOpen, setCBTModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohortCourses, setCohortCourses] = useState([]);

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

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Exam created successfully:", response.data);
      setIsSubmitting(false);
      closeModal();
      window.location.reload();
      Swal.fire({
        title: "Success!",
        text: "The exam was created successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Error creating exam:", err);
      setIsSubmitting(false);
      alert("Failed to create exam. Please try again.");
    }
  };


  // Fetch data from /api/cbt-exams
  const [cbtExams, setCbtExams] = useState([]);
  useEffect(() => {
    const fetchCbtExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cbt-exams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCbtExams(response.data); // Update based on the actual response structure
        setFilteredCourses(response.data); // To handle filtering later
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CBT exams:", error);
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

  // const handleEdit = (row) => {
  //   console.log("Edit details for:", row);
  //   // Example: Populate the form with row data and open the modal for editing
  //   // setFormData(row);
  //   // setIsModalOpen(true);
  // };

  const handleEdit = (row) => {
    setCbtExams(row);
    setCBTModalOpen(true);
  };


  const handleSubmitEdit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare the payload
      const payload = {
        examName: cbtExams.examName,
        details: cbtExams.details,
        examDate: cbtExams.examDate,
        examTime: cbtExams.examTime,
        isShuffle: cbtExams.isShuffle,
        isRandom: cbtExams.isRandom,
        canRetake: cbtExams.canRetake,
        canSeeResult: cbtExams.canSeeResult,
        status: cbtExams.status,
        courseId: cbtExams.courseId,
        cohortId: cbtExams.cohortId,
        timeAllowed: cbtExams.timeAllowed,
      };

      // Send the PUT request using axios
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/${cbtExams.examId}`,
        payload
      );

      // Check response status to determine success
      if (response.status === 200 || response.status === 204) {
        // Refresh the router and show success message
        setIsSubmitting(false);
        Swal.fire({
          title: "Success!",
          text: "The exam was updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
        setCBTModalOpen(false);
        window.location.reload()
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating exam:", error);
      setIsSubmitting(false);
      Swal.fire({
        title: "Error",
        text: "Failed to update exam. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };



  // Function to fetch courses based on selected cohort
  const fetchCoursesForCohort = async (cohortId) => {
    if (!cohortId) return;

    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/${cohortId}/courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Axios automatically parses JSON, so use response.data directly
      setCohortCourses(response.data.courses);
      console.log(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };



  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded shadow"
          onClick={openModal}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Exam
        </button>


        <a href="/assessments"><button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"

        >
          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To Dashboard
        </button></a>
      </div>

      <DataTable
        columns={[
          { name: "Exam Name", selector: (row) => row?.examName, sortable: true },
          { name: "Course ID", selector: (row) => row?.courseId, sortable: true },
          { name: "Course Name", selector: (row) => row?.course?.course_name, sortable: true },
          { name: "Exam Date", selector: (row) => row?.examDate, sortable: true },
          { name: "Time Allowed", selector: (row) => row?.timeAllowed, sortable: true },
          {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
              <span
  style={{
    backgroundColor: row.status.trim().toLowerCase() === "active" ? "green" : "red",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
  }}
>
  {row.status}
</span>

            ),
          },
          {
            name: "Actions",
            cell: (row) => (
              <div className="flex space-x-2">
                <button
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
                </button>
                <a
                  href={`/assessments/questions?examName=${encodeURIComponent(row.examName)}&examId=${encodeURIComponent(row.examId)}&cohortName=${encodeURIComponent(row.cohort?.cohort_name)}`}
                  className="text-blue-500 hover:text-green-700"
                >
                  <FontAwesomeIcon icon={faPlus} />
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
            <form onSubmit={handleSave}>
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
                name="cohortId"
                value={formData.cohortId}
                onChange={(e) => {
                  handleInputChange(e);
                  fetchCoursesForCohort(e.target.value);
                }}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Cohort</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.cohort_id} value={cohort.cohort_id}>
                    {cohort.cohort_name}
                  </option>
                ))}
              </select>

              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
                disabled={!formData.cohortId} // Disable if no cohort selected
                required
              >
                <option value="">Select Course</option>
                {cohortCourses.map((course) => (
                  <option key={course?.course_id} value={course?.course_id}>
                    {course?.course_name}
                  </option>
                ))}
              </select>


            </div>
            <div className="mt-4 flex justify-end space-x-4">
              {/* <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Create
              </button> */}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    Creating...
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4 ml-2"></span>
                  </span>
                ) : (
                  "Create"
                )}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-500 text-white rounded"
                style={{ color: 'red' }}
              >
                Cancel
              </button>
            </div>
            </form>
          </div>
        </div>
      )}


      {isCBTModalOpen && cbtExams && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add/Edit Exam</h2>
            <div className="space-y-4">
              <input
              required
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
              required
                type="date"
                name="examDate"
                value={cbtExams.examDate}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
              required
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
required
                name="cohortId"
                value={cbtExams.cohortId}
                onChange={(e) => {
                  handleInputChange2(e);
                  fetchCoursesForCohort(e.target.value);
                }}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Cohort</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.cohort_id} value={cohort.cohort_id}>
                    {cohort.cohort_name}
                  </option>
                ))}
              </select>

              <select
              required
                name="courseId"
                value={cbtExams.courseId}
                onChange={handleInputChange2}
                className="border border-gray-300 rounded w-full px-4 py-2"
                disabled={!cbtExams.cohortId} // Disable if no cohort selected
              >
                <option value="">Select Course</option>
                {cohortCourses.map((course) => (
                  <option key={course?.course_id} value={course?.course_id}>
                    {course?.course_name}
                  </option>
                ))}
              </select>

            </div>
            <div className="mt-4 flex justify-end space-x-4">
             
              <button
                onClick={handleSubmitEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    Saving...
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4 ml-2"></span>
                  </span>
                ) : (
                  "Save"
                )}
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

export default AssessmentsTable;
