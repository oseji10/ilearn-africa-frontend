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
    score: "",
    isCorrect: "",
    questionId: ""
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setQuestionData({ question: "", options: ["", "", "", ""], correctOptionIndex: null }); // Reset form data
  };

  const handleRadioChange = (index) => {
    setQuestionData((prev) => ({ ...prev, correctOptionIndex: index }));
  };

  // const handleInputChange = (e, index = null) => {
  //   const { name, value } = e.target;

  //   if (name === "question") {
  //     setQuestionData((prev) => ({ ...prev, question: value }));
  //   } else if (name === "option" && index !== null) {
  //     const updatedOptions = [...questionData.options];
  //     updatedOptions[index] = value; // Update the specific option
  //     setQuestionData((prev) => ({ ...prev, options: updatedOptions }));
  //   } else if (name === "score") {
  //     setQuestionData((prev) => ({ ...prev, score: value })); // Update the score
  //   }
  // };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name === "question") {
      setQuestionData((prev) => ({ ...prev, question: value }));
    } else if (name === "option" && index !== null) {
      const updatedOptions = [...questionData.options];
      if (typeof updatedOptions[index] === "object") {
        updatedOptions[index] = {
          ...updatedOptions[index],
          optionDetail: value, // Update the optionDetail if it's an object
        };
      } else {
        updatedOptions[index] = value; // Update directly if it's a string
      }
      setQuestionData((prev) => ({ ...prev, options: updatedOptions }));
    } else if (name === "score") {
      setQuestionData((prev) => ({ ...prev, score: value }));
    }
  };



  const handleInputChange3 = (e, index) => {
    const { value } = e.target;
    setQuestionData((prevState) => {
      const updatedOptions = [...prevState.options];
      // Preserve optionId while updating the optionDetail
      updatedOptions[index] = {
        ...updatedOptions[index],
        optionDetail: value,
      };
      return { ...prevState, options: updatedOptions };
    });
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
      setQuestionData({
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: null,
        examId: examId,
        score: "",
        isCorrect: "",
        questionId: ""
      });
      closeModal();
      window.location.reload();
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


  const handleUpdateQuestion = async () => {
    try {
      const token = localStorage.getItem("token");

      // Prepare the payload
      const updatedQuestionData = {
        question: questionData.question,
        score: questionData.score,
        correctOptionIndex: questionData.correctOptionIndex, // Ensure this is included
        options: questionData.options.map((option, index) => ({
          optionId: option.optionId || null, // Include `optionId` if editing an existing option
          optionDetail: option.optionDetail || option, // Handle structure properly
          isCorrect: index === questionData.correctOptionIndex ? 1 : 0,
        })),
      };


      // Send the request to update the question
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/question/${questionData.questionId}`, // Replace questionData.id with the actual question ID
        updatedQuestionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Question updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      closeCBTModal();
      window.location.reload();
    } catch (err) {
      console.error("Error updating question:", err);

      Swal.fire({
        title: "Error",
        text: "Failed to update the question. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  
  
  const handleDelete = async (row) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this question? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });
  
      // If user confirmed
      if (result.isConfirmed) {
        // Send DELETE request
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/question/${row.questionId}`);
        
        if (response.status === 200) {
          // Show success message
          Swal.fire(
            'Deleted!',
            'The question has been deleted.',
            'success'
          );
          window.location.reload();
        } else {
          // Show error message if deletion fails
          Swal.fire(
            'Error!',
            'There was an issue deleting the question.',
            'error'
          );
        }
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        'There was an issue deleting the question.',
        'error'
      );
      console.error(error);
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
    const correctOption = row.options.find((option) => option.isCorrect === 1);
    Swal.fire({
      title: "Question Details",
      html: `
        <p><strong>Question:</strong> ${row?.question}</p>
        <p><strong>Options:</strong></p>
        <ul>
          ${row.options
          .map(
            (option, index) =>
              `<li>Option ${index + 1}: ${option.optionDetail}</li>`
          )
          .join("")}
        </ul>
        <p><strong>Correct Answer:</strong> ${correctOption
          ? `${correctOption.optionDetail}`
          : "N/A"
        }</p>
        <p><strong>Score:</strong> ${row?.score || "N/A"}</p>
      `,
      confirmButtonText: "Close",
    });
  };

  const handleEdit = (row) => {
    const correctOptionIndex = row?.options?.findIndex((option) => option.isCorrect === 1);

    setQuestionData({
      question: row?.question || "",
      options: row?.options.map((opt) => ({
        optionDetail: opt.optionDetail || opt, // Ensure consistent structure
        optionId: opt.optionId || null, // Include optionId if available
      })),
      correctOptionIndex: correctOptionIndex !== -1 ? correctOptionIndex : null,
      examId: examId,
      score: row?.score || "",
      questionId: row?.questionId || "",
    });

    setCBTModalOpen(true); // Open the modal to edit the question
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

        <a href="/assessments/all-assessments"><button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          
        >
          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To Exams
        </button></a>
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
                  onClick={() => handleDelete(row)}
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
                placeholder="Type your question here..."
                value={questionData.question}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              {/* <label>Score:</label> */}
              <input
                type="number"
                name="score"
                placeholder="score"
                value={questionData.score}
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
                      value={typeof option === "string" ? option : option.optionDetail} // Show the correct value
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
      {isCBTModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Question</h2>
            <div className="space-y-4">
              <textarea
                name="question"
                placeholder="Enter your question"
                value={questionData.question}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              {/* <label>Score:</label> */}
              <input
                type="number"
                name="score"
                value={questionData.score}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <h3 className="text-lg font-semibold mt-4">Options:</h3>
              {questionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {/* Option {index + 1}  */}
                  <input
                    type="radio"
                    name="correctOption"
                    checked={questionData.correctOptionIndex === index}
                    onChange={() => handleRadioChange(index)}
                  />
                  <input
                    type="text"
                    name="option"
                    value={option.optionDetail || option} // Handle both object and string cases
                    onChange={(e) => handleInputChange(e, index)}
                    className="border p-2 rounded w-full"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="ml-2 px-2 py-1 bg-red text-white rounded"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={addOption}
              >
                Add Option
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCBTModalOpen(false)}
                className="px-4 py-2 bg-red text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuestion}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default QuestionsTable;
