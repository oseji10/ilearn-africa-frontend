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
  const [isLoading, setIsLoading] = useState(false);

  // Fetch questions and timeAllowed from API
  useEffect(() => {
    const fetchExamData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${examId}`);
        const data = await response.json();
        
        setQuestions(data);
        setIsLoading(false);

        // Set the timer based on the timeAllowed from the exam data
        if (data.length > 0 && data[0]?.exams?.timeAllowed) {
          const timeAllowed = parseInt(data[0].exams.timeAllowed, 10);
          const storedTime = localStorage.getItem("timer");

          // Use stored time if available, else use the timeAllowed
          const initialTime = storedTime ? parseInt(storedTime, 10) : timeAllowed * 60;
          setTimer(initialTime);
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
        // setIsLoading(false);
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
        localStorage.setItem("timer", newTimer);
        localStorage.setItem("examId", examId);
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
            router.push(`/client-dashboard/my-assessments/exam-completed?examId=${examId}&examName=${examName}`); // Navigate to a success page or reload
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

  // if (questions.length === 0 || timer === null) return <p>No questions in this exam. Please contact admin</p>;

  // {
  //   isLoading ? (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  //     </div>
  //   ) : questions.length > 0 ? (
  //     questions.map((question) => (
  //       <div key={question.id}>{question.text}</div>
  //     ))
  //   ) : timer === null ? (
  //     <p>No questions in this exam. Please contact admin</p>
  //   ) : null
  // }



  const currentQuestion = questions[currentQuestionIndex];
  const allQuestionsAnswered = questions.every(
    (question) => selectedAnswers[question.questions[0]?.questionId]
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6">
        
        {/* Show Spinner while Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          // Show "No Questions" message if loading is done and questions are empty
          <p className="text-center text-red-500 font-semibold">
            No questions in this exam. Please contact admin.
          </p>
        ) : (
          <>
            {/* Exam Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">{examName}</h1>
              <div className="text-red-500 font-bold text-lg">
                Time Left: {formatTime(timer)}
              </div>

              <div className="mt-6 text-center">
              <button
                onClick={handleSubmitExam}
                disabled={!allQuestionsAnswered}
                className={`px-6 py-2 ${
                  allQuestionsAnswered ? "bg-green-500 text-white " : "bg-gray-400 cursor-not-allowed text-black rounded shadow"
                }`}
              >
                Submit Exam
              </button>
            </div>
            </div>
  
            {/* Question Display */}
            <h2 className="text-lg font-semibold mb-4">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <p className="mb-4">{questions[currentQuestionIndex]?.questions[0]?.question}</p>
  
            <div className="space-y-2">
              {questions[currentQuestionIndex]?.questions[0]?.options?.map((option) => (
                <label key={option.optionId} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question-${questions[currentQuestionIndex].questions[0].questionId}`}
                    checked={selectedAnswers[questions[currentQuestionIndex].questions[0].questionId] === option.optionId}
                    onChange={() => handleAnswerSelect(questions[currentQuestionIndex].questions[0].questionId, option.optionId)}
                    className="form-radio"
                  />
                  <span>{option.optionDetail}</span>
                </label>
              ))}
            </div>
  
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="px-4 py-2 rounded bg-blue-500 text-white">
                Previous
              </button>
              <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="px-4 py-2 rounded bg-blue-500 text-white">
                Next
              </button>
            </div>
  
            {/* Submit Button */}
            {/* <div className="mt-6 text-center">
              <button
                onClick={handleSubmitExam}
                disabled={!allQuestionsAnswered}
                className={`px-6 py-2 ${
                  allQuestionsAnswered ? "bg-green-500 text-white " : "bg-gray-400 cursor-not-allowed text-black rounded shadow"
                }`}
              >
                Submit Exam
              </button>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
  
};

export default ExamPage;
