"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ExamPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examName = searchParams.get("examName");
  const timeAllowed = parseInt(searchParams.get("timeAllowed")) || 30; // Default to 30 minutes if not provided
  const examId = searchParams.get("examId");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(timeAllowed * 60); // Convert minutes to seconds

  // Fetch questions from API (replace with your endpoint)
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${examId}`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [examId]);

  // Timer logic
  useEffect(() => {
    if (timer === 0) {
      handleSubmitExam(); // Auto-submit when timer reaches zero
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, [timer]);

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

  const handleSubmitExam = () => {
    // Submit the answers to the API (replace with your endpoint)
    fetch("/api/exam/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examName,
        answers: selectedAnswers,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Exam submitted successfully!");
        router.push("/exam/completion"); // Redirect to a completion page
      })
      .catch((error) => {
        console.error("Error submitting exam:", error);
      });
  };

  if (questions.length === 0) return <p>Loading questions...</p>;

  const currentQuestion = questions[currentQuestionIndex];

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

        {/* Numbered navigation buttons */}
        <div className="mt-6 flex justify-center space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleGoToQuestion(index)}
              className={`px-4 py-2 rounded ${
                currentQuestionIndex === index
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSubmitExam}
            className="px-6 py-2 bg-green-500 text-white rounded shadow"
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
