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
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";

const QuestionsTable = () => {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');

  // const [courseLists, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCBTModalOpen, setCBTModalOpen] = useState(false);
  
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""], 
    correctOptionIndex: null, 
    examId: examId,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setQuestionData({ question: "", options: ["", "", "", ""] , correctOptionIndex: null}); // Reset form data
  };

  const handleRadioChange = (index) => {
    setQuestionData((prev) => ({ ...prev, correctOptionIndex: index }));
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name === "question") {
      setQuestionData((prev) => ({ ...prev, question: value }));
    } else if (name === "option") {
      const updatedOptions = [...questionData.options];
      updatedOptions[index] = value;
      setQuestionData((prev) => ({ ...prev, options: updatedOptions }));
    }
  };

  const addOption = () => {
    setQuestionData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index) => {
    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSaveQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/question`,
        questionData,
        
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Question saved successfully:", response.data);
      Swal.fire({
        title: "Success!",
        text: "Question added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
      closeModal();
    } catch (err) {
      console.error("Error saving question:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to add question. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  const handleInputChange2 = (e) => {
    const { name, value, type, checked } = e.target;
    setCbtExams((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);
  const closeCBTModal = () => setCBTModalOpen(false);


  // Fetch data from /api/cbt-exams
  const [cbtExams, setCbtExams] = useState([]);
  useEffect(() => {
    const fetchCbtExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/questions`, {
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
      };
  
      // Send the PUT request using axios
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/${cbtExams.examId}`,
        payload
      );
  
      // Check response status to determine success
      if (response.status === 200 || response.status === 204) {
        // Refresh the router and show success message
       
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
      Swal.fire({
        title: "Error",
        text: "Failed to update exam. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
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
          <FontAwesomeIcon icon={faPlus} /> Add New Question
        </button>
      </div>

      <DataTable
  columns={[
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "50px", // Adjust width as needed
    },
    { 
      name: "Question", 
      selector: (row) => row?.question, 
      sortable: true 
    },
    // {
    //   name: "Status",
    //   selector: (row) => row.status,
    //   sortable: true,
    //   cell: (row) => (
    //     <span
    //       className={`px-2 py-1 rounded text-white ${
    //         row.status === "active" ? "bg-green-500" : "bg-red"
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
          <button
            className="text-red hover:text-green-700"
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
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
            <h2 className="text-xl font-bold mb-4">Add New Question</h2>
            <div className="space-y-4">
              <textarea
                name="question"
                placeholder="Enter your question"
                value={questionData.question}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <div>
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                       <input
        type="radio"
        name="correctOption"
        checked={questionData.correctOptionIndex === index}
        onChange={() => handleRadioChange(index)}
        className="mr-2"
      />
                    <input
                      type="text"
                      name="option"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleInputChange(e, index)}
                      className="border border-gray-300 rounded w-full px-4 py-2"
                    />
                    {questionData.options.length > 1 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="ml-2 px-2 py-1 bg-red text-white rounded"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Option
                </button>
              </div>
              <button
                onClick={handleSaveQuestion}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
              >
                Save Question
              </button>&nbsp;
              <button
                onClick={closeModal}
                className="mt-4 px-4 py-2 bg-red text-white rounded"
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

export default QuestionsTable;
