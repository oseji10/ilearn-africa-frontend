"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

const ExamPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examName = searchParams.get("examName");
  const examId = searchParams.get("examId");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(null); // Initialize as null until timeAllowed is fetched

  // Fetch questions and timeAllowed from API
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${examId}`);
        const data = await response.json();
        
        setQuestions(data);

        // Set the timer based on the timeAllowed from the first question's exam data
        if (data.length > 0 && data[0]?.exams?.timeAllowed) {
          const timeAllowed = parseInt(data[0].exams.timeAllowed, 10);
          setTimer(timeAllowed * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    fetchExamData();
  }, [examId]);

 // Initialize timer only after timeAllowed is set
useEffect(() => {
  if (!questions.length) return; // Ensure questions are loaded before proceeding

  const savedTimer = localStorage.getItem(`exam-timer-${examId}`);
  if (savedTimer) {
    setTimer(parseInt(savedTimer, 10)); // Restore saved timer from local storage
  } else if (questions[0]?.exams?.timeAllowed) {
    const timeAllowed = parseInt(questions[0].exams.timeAllowed, 10) * 60; // Convert to seconds
    setTimer(timeAllowed);
  }
}, [examId, questions]);


useEffect(() => {
  if (timer === 0) {
    handleSubmitExam(); // Auto-submit when timer ends
    localStorage.removeItem(`exam-timer-${examId}`);
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => {
      const updated = prev - 1;
      localStorage.setItem(`exam-timer-${examId}`, updated.toString());
      return updated;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [timer, examId]);


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

 

  const handleSubmitExam = async () => {
    const clientId = localStorage.getItem('client_id');
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
      });
    }
  };
  

  if (questions.length === 0 || timer === null) return <p>Loading...</p>;

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
        <div className="mt-6 flex justify-center space-x-2">
  {questions.map((_, index) => {
    let buttonClass = "bg-gray-300 text-black"; // Default: unanswered question
    if (selectedAnswers[questions[index]?.questions[0]?.questionId]) {
      buttonClass = "bg-green-300 text-black"; // Answered question
    }
    if (currentQuestionIndex === index) {
      buttonClass = "bg-green-500 text-white"; // Current question
    }

    return (
      <button
        key={index}
        onClick={() => handleGoToQuestion(index)}
        className={`px-4 py-2 rounded ${buttonClass}`}
      >
        {index + 1}
      </button>
    );
  })}
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
