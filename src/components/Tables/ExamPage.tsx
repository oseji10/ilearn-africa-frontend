"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import styles from '../../css/ExamComponent.module.css'

const ExamPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examName = searchParams.get("examName");
  const examId = searchParams.get("examId");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(null); // Initialize timer
  const [isExamActive, setIsExamActive] = useState(true); // Track if the exam is still active

  // Fetch questions and timeAllowed from API
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${examId}`);
        const data = await response.json();
        
        setQuestions(data);

        // Set the timer based on the timeAllowed from the exam data
        if (data.length > 0 && data[0]?.exams?.timeAllowed) {
          const timeAllowed = parseInt(data[0].exams.timeAllowed, 10);
          const storedTime = localStorage.getItem("timer");

          // Use stored time if available, else use the timeAllowed
          const initialTime = storedTime ? parseInt(storedTime, 10) : timeAllowed * 60;
          setTimer(initialTime); // Convert minutes to seconds
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    fetchExamData();
  }, [examId]);

  // Countdown timer logic
  useEffect(() => {
    if (timer === null || !isExamActive) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setIsExamActive(false); // End exam when timer reaches zero
          return 0;
        }
        const newTimer = prevTimer - 1;
        localStorage.setItem("timer", newTimer); // Save the new timer value
        return newTimer;
      });
    }, 1000);

    // Cleanup on component unmount or when timer is reset
    return () => clearInterval(interval);
  }, [timer, isExamActive]);

  // Format time as minutes:seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmitExam = async () => {
    if (hasSubmitted) return; // Prevent multiple submissions
  
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to submit the exam? Once submitted, you cannot make changes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "No, return to exam",
      customClass: {
        confirmButton: styles['confirm-btn'],
        cancelButton: styles['cancel-btn'],
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setHasSubmitted(true); // Prevent further submissions after confirmation
  
        const clientId = localStorage.getItem("client_id");
        const answers = Object.entries(selectedAnswers).map(([questionId, optionSelected]) => ({
          questionId,
          optionSelected,
        }));
  
        const payload = {
          clientId: clientId,
          examId: examId,
          answers,
        };
  
        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/exam-result`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          Swal.fire({
            title: "Success!",
            text: "Exam submitted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: styles['confirm-btn'],
              cancelButton: styles['cancel-btn'],
            },
          }).then(() => {
            router.push("/client-dashboard/my-assessments/exam-completed"); // Navigate to a success page or reload
          });
        } catch (err) {
          console.error("Error submitting exam:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to submit exam. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: styles['confirm-btn'],
              cancelButton: styles['cancel-btn'],
            },
          });
        }
      } else {
        // If the candidate clicks "No," do nothing and return to the exam
        Swal.fire({
          title: "Continue Exam",
          text: "You can continue with your exam.",
          icon: "info",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: styles['confirm-btn'],
            cancelButton: styles['cancel-btn'],
          },
        });
      }
    });
  };

  if (questions.length === 0 || timer === null) return <p>No questions in this exam. Please contact admin</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const allQuestionsAnswered = questions.every(
    (question) => selectedAnswers[question.questions[0]?.questionId]
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">{examName}</h1>
          <div className="text-red-500 font-bold text-lg">
            Time Left: {formatTime(timer)}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="mb-4">{currentQuestion?.questions[0]?.question}</p>
          <div className="space-y-2">
            {currentQuestion?.questions[0]?.options?.length > 0 ? (
              currentQuestion?.questions[0]?.options.map((option) => (
                <label
                  key={option.optionId}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questions[0].questionId}`}
                    checked={
                      selectedAnswers[currentQuestion.questions[0].questionId] ===
                      option.optionId
                    }
                    onChange={() =>
                      handleAnswerSelect(currentQuestion.questions[0].questionId, option.optionId)
                    }
                    className="form-radio"
                  />
                  <span>{option.optionDetail}</span>
                </label>
              ))
            ) : (
              <p>No options available</p>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded ${
              currentQuestionIndex === 0
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`px-4 py-2 rounded ${
              currentQuestionIndex === questions.length - 1
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>

        {/* Question Navigation Buttons */}
        <div className="mt-4 flex justify-center space-x-2">
  {questions.map((_, index) => (
    <button
      key={index}
      onClick={() => handleGoToQuestion(index)}
      className={`px-4 py-2 rounded ${index === currentQuestionIndex ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
    >
      {index + 1}
    </button>
  ))}
</div>


        <div className="mt-6 text-center">
          <button
            onClick={handleSubmitExam}
            disabled={!allQuestionsAnswered}
            className={`px-6 py-2 ${
              allQuestionsAnswered ? "bg-green-500 text-white " : "bg-gray cursor-not-allowed text-black rounded shadow"
            } `}
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
