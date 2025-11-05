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
import { useSearchParams } from "next/navigation";

const QuestionsTable = () => {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCBTModalOpen, setCBTModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize questionData with consistent structure
  const [questionData, setQuestionData] = useState({
    question: "",
    options: Array(4).fill({ 
      optionDetail: "", 
      optionId: null,
      isCorrect: 0
    }),
    correctOptionIndex: null,
    examId: examId,
    score: "",
    questionId: ""
  });

  // Update handleEdit to properly handle API response format
  const handleEdit = (row) => {
    // Convert string "1"/"0" to numbers 1/0 for proper comparison
    const options = row.options.map(option => ({
      ...option,
      isCorrect: parseInt(option.isCorrect)
    }));

    // Find the correct option index
    const correctOptionIndex = options.findIndex(option => option.isCorrect === 1);
    
    setQuestionData({
      question: row.question,
      options: options,
      correctOptionIndex: correctOptionIndex,
      examId: examId,
      score: row.score,
      questionId: row.questionId
    });
    setCBTModalOpen(true);
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setQuestionData({
      question: "",
      options: Array(4).fill({ 
        optionDetail: "", 
        optionId: null,
        isCorrect: 0
      }),
      correctOptionIndex: null,
      examId: examId,
      score: "",
      questionId: ""
    });
  };

  const closeCBTModal = () => {
    setCBTModalOpen(false);
    setQuestionData({
      question: "",
      options: Array(4).fill({ 
        optionDetail: "", 
        optionId: null,
        isCorrect: 0
      }),
      correctOptionIndex: null,
      examId: examId,
      score: "",
      questionId: ""
    });
  };

  const handleRadioChange = (index) => {
    setQuestionData((prev) => ({ ...prev, correctOptionIndex: index }));
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name === "question") {
      setQuestionData((prev) => ({ ...prev, question: value }));
    } else if (name === "option" && index !== null) {
      setQuestionData((prev) => {
        const updatedOptions = [...prev.options];
        updatedOptions[index] = { ...updatedOptions[index], optionDetail: value };
        return { ...prev, options: updatedOptions };
      });
    } else if (name === "score") {
      setQuestionData((prev) => ({ ...prev, score: value }));
    }
  };

  const addOption = () => {
    setQuestionData((prev) => ({
      ...prev,
      options: [...prev.options, { optionDetail: "", optionId: null, isCorrect: 0 }],
    }));
  };

  const removeOption = (index) => {
    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      // Reset correctOptionIndex if we're removing the currently selected correct option
      correctOptionIndex: prev.correctOptionIndex === index ? null : 
                         (prev.correctOptionIndex > index ? prev.correctOptionIndex - 1 : prev.correctOptionIndex)
    }));
  };

  const handleSaveQuestion = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/question`,
        {
          ...questionData,
          options: questionData.options.map((opt, index) => ({
            optionDetail: opt.optionDetail,
            optionId: opt.optionId,
            isCorrect: index === questionData.correctOptionIndex ? "1" : "0", // Ensure string format for API
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsSubmitting(false);
      Swal.fire({
        title: "Success!",
        text: "Question added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
      closeModal();
      window.location.reload();
    } catch (err) {
      setIsSubmitting(false);
      console.error("Error saving question:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to add question. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleUpdateQuestion = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const updatedQuestionData = {
        question: questionData.question,
        score: questionData.score,
        options: questionData.options.map((option, index) => ({
          optionId: option.optionId,
          optionDetail: option.optionDetail,
          isCorrect: questionData.correctOptionIndex === index ? "1" : "0" // Convert back to string if needed by API
        })),
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/question/${questionData.questionId}`,
        updatedQuestionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsSubmitting(false);
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
      setIsSubmitting(false);
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
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this question? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/question/${row.questionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          Swal.fire("Deleted!", "The question has been deleted.", "success");
          window.location.reload();
        } else {
          Swal.fire("Error!", "There was an issue deleting the question.", "error");
        }
      }
    } catch (error) {
      Swal.fire("Error!", "There was an issue deleting the question.", "error");
      console.error(error);
    }
  };

  const handleView = (row) => {
    const correctOptionIndex = row?.options?.findIndex((option) => parseInt(option.isCorrect) === 1);
    const correctOption = correctOptionIndex !== -1 ? row.options[correctOptionIndex] : null;

    Swal.fire({
      title: "Question Details",
      html: `
        <p><strong>Question:</strong> ${row?.question || "N/A"}</p>
        <p><strong>Options:</strong></p>
        <ul>
          ${row?.options
            ?.map(
              (option, index) =>
                `<li>Option ${index + 1}: ${option.optionDetail || "N/A"}</li>`
            )
            .join("") || "<li>No options available</li>"}
        </ul>
        <p><strong>Correct Answer:</strong> ${
          correctOption ? correctOption.optionDetail : "N/A"
        }</p>
        <p><strong>Score:</strong> ${row?.score || "N/A"}</p>
      `,
      confirmButtonText: "Close",
    });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleBulkUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", examId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-questions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        alert("Questions uploaded successfully!");
        setIsModalOpen2(false);
        window.location.reload();
      } else {
        alert("Failed to upload questions.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload questions.");
    }
    setIsUploading(false);
  };

  const [cbtExams, setCbtExams] = useState([]);
  useEffect(() => {
    const fetchCbtExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams/questions/${examId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        setCbtExams(response.data);
        setFilteredCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CBT exams:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCbtExams();
  }, [examId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded shadow"
            onClick={openModal}
          >
            <FontAwesomeIcon icon={faPlus} /> Add New Question
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded shadow"
            onClick={() => setIsModalOpen2(true)}
          >
            Bulk Upload
          </button>
        </div>
        <a href="/assessments/all-assessments">
          <button className="px-4 py-2 bg-blue-500 text-white rounded shadow">
            <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To Exams
          </button>
        </a>
      </div>

      {/* Show message when no questions exist, but still render the table */}
      {!cbtExams.length && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">No questions available. Add new questions or use bulk upload to get started.</p>
        </div>
      )}

      <DataTable
        columns={[
          {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "50px",
          },
          {
            name: "Question",
            selector: (row) => row?.question,
            sortable: true,
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
                <button
                  className="text-red hover:text-red-700"
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
        noDataComponent={<p className="p-4">No questions available. Add new questions to see them here.</p>}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Question</h2>
            <form onSubmit={handleSaveQuestion}>
              <textarea
                required
                name="question"
                placeholder="Type your question here..."
                value={questionData.question}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                required
                type="number"
                name="score"
                placeholder="Score"
                value={questionData.score}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2 mt-2"
              />
              <br />
              <br />
              <div>
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      required
                      type="radio"
                      name="correctOption"
                      checked={questionData.correctOptionIndex === index}
                      onChange={() => handleRadioChange(index)}
                      className="mr-2"
                    />
                    <input
                      required
                      type="text"
                      name="option"
                      placeholder={`Option ${index + 1}`}
                      value={option.optionDetail}
                      onChange={(e) => handleInputChange(e, index)}
                      className="border border-gray-300 rounded w-full px-4 py-2"
                    />
                    {questionData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-2 px-2 py-1 bg-red text-white rounded"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Option
                </button>
              </div>
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    Saving Question...
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4 ml-2"></span>
                  </span>
                ) : (
                  "Save Question"
                )}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="mt-4 ml-2 px-4 py-2 bg-red text-white rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {isCBTModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Question</h2>
            <form onSubmit={handleUpdateQuestion}>
              <div className="space-y-4">
                <textarea
                  required
                  name="question"
                  placeholder="Enter your question"
                  value={questionData.question}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded w-full px-4 py-2"
                />
                <input
                  required
                  type="number"
                  name="score"
                  value={questionData.score}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded w-full px-4 py-2"
                />
                <h3 className="text-lg font-semibold mt-4">Options:</h3>
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
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
                      value={option.optionDetail}
                      onChange={(e) => handleInputChange(e, index)}
                      className="border p-2 rounded w-full"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
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
                  type="button"
                  onClick={closeCBTModal}
                  className="px-4 py-2 bg-red text-white rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      Saving Changes...
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4 ml-2"></span>
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Bulk Upload Questions</h2>
            <input type="file" onChange={handleFileChange} className="mb-2" />
            <div className="flex justify-end">
              <button
                className="p-2 bg-red text-white rounded mr-2"
                onClick={() => setIsModalOpen2(false)}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-blue-500 text-white rounded"
                onClick={handleBulkUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTable;