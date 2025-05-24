"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import styles from '../../css/ExamComponent.module.css';
import CryptoJS from "crypto-js";

const SECRET_KEY = `${process.env.TIMER_SECRET_KEY}`; // Replace with a strong secret key

// Encrypt data
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data.toString(), SECRET_KEY).toString();
};

// Decrypt data
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return parseInt(bytes.toString(CryptoJS.enc.Utf8), 10);
  } catch (error) {
    return null; // Handle invalid decryption cases
  }
};

const ExamPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examName = searchParams.get("examName");
  const examId = searchParams.get("examId");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(null);
  const [isExamActive, setIsExamActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingLoader, setIsSubmittingLoader] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  useEffect(() => {
    const fetchExamData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${examId}`);
        const data = await response.json();
        setQuestions(data);
        setIsLoading(false);

        if (data.length > 0 && data[0]?.exams?.timeAllowed) {
          const timeAllowed = parseInt(data[0].exams.timeAllowed, 10) * 60;
          const storedTime = localStorage.getItem("timer");
          const decryptedTime = storedTime ? decryptData(storedTime) : null;

          setTimer(decryptedTime || timeAllowed);
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (timer === null || !isExamActive) return;  // Prevent reinitializing the timer
  
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === null) return null; // Stop updating if cleared
        if (prevTimer <= 1) {
          clearInterval(interval);
          setIsExamActive(false);
          if (!hasSubmitted) {
            setHasSubmitted(true);
            handleSubmitExam(true);
          }
          return 0;
        }
  
        if (prevTimer === 300) {
          Swal.fire({
            title: "Warning!",
            text: "Only 5 minutes left!",
            icon: "warning",
            timer: 3000,
          });
        }
  
        if (prevTimer === 60) {
          Swal.fire({
            title: "Hurry up!",
            text: "Less than 1 minute remaining!",
            icon: "error",
            timer: 3000,
          });
        }
  
        const newTimer = prevTimer - 1;
        localStorage.setItem("timer", encryptData(newTimer));
        return newTimer;
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [timer, isExamActive]);
  

  // **Proctoring: Detect tab switch and app switch**
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        showTabWarning();
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      showTabWarning();
    };

    const showTabWarning = () => {
      if (tabSwitchCount >= 3) {
        Swal.fire({
          title: "Exam Violation!",
          text: "You have switched tabs/applications multiple times. Further violations may result in exam submission.",
          icon: "error",
          confirmButtonText: "Ok",
          customClass: {
            confirmButton: styles['confirm-btn'],
            cancelButton: styles['cancel-btn'],
          },
        });

        if (tabSwitchCount >= 5) {
          Swal.fire({
            title: "FINAL WARNING!",
            text: "You have continuously violated exam ethics by switiching tabs/applications even after several warnings. If this happens again, your exam will be submitted. This is your last WARNING!",
            icon: "error",
            confirmButtonText: "Ok",
            customClass: {
              confirmButton: styles['confirm-btn'],
              cancelButton: styles['cancel-btn'],
            },
          });
        }

        if (tabSwitchCount >= 6) {
          handleForceSubmitExam(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [tabSwitchCount]);

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

  const handleSubmitExam = async (skipConfirmation = false) => {
    if (hasSubmitted) return;
  
    const submitExam = async () => {
      setHasSubmitted(true);
      const clientId = localStorage.getItem("client_id");
  
      // Clear the timer properly
      localStorage.removeItem("timer");
      setTimer(null);
  
      const answers = Object.entries(selectedAnswers).map(([questionId, optionSelected]) => ({
        questionId,
        optionSelected,
      }));
  
      try {
        setIsSubmittingLoader(true); // Start spinner
        const token = localStorage.getItem("token");
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/exam-result`, { clientId, examId, answers }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSubmittingLoader(false); // Start spinner
        Swal.fire({
          title: "Exam Submitted Successfully!",
          text: "Exam submitted successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: styles['confirm-btn'],
            cancelButton: styles['cancel-btn'],
          },
        }).then(() => {
          router.push(`/client-dashboard/my-assessments/exam-completed?examId=${examId}&examName=${examName}`);
        });
      } catch (err) {
        setIsSubmittingLoader(false); // Start spinner
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
    };
  
    if (skipConfirmation) {
      submitExam();
    } else {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to submit the exam?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, submit",
        cancelButtonText: "No, continue",
        customClass: {
          confirmButton: styles['confirm-btn'],
          cancelButton: styles['cancel-btn'],
        },
      }).then((result) => {
        if (result.isConfirmed) {
          submitExam();
        }
      });
    }
  };
  
  

  const handleForceSubmitExam = async (skipConfirmation = false) => {
    if (hasSubmitted) return;
  
    const submitExam = async () => {
      setHasSubmitted(true);
      const clientId = localStorage.getItem("client_id");
      const answers = Object.entries(selectedAnswers).map(([questionId, optionSelected]) => ({
        questionId,
        optionSelected,
      }));
  
      try {
        const token = localStorage.getItem("token");
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/exam-result`, { clientId, examId, answers }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.removeItem("timer");
        Swal.fire({
          title: "Exam Submitted!",
          text: "Your exam exam has been submitted due to ethics violation.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: styles['confirm-btn'],
            cancelButton: styles['cancel-btn'],
          },
        }).then(() => {
          router.push(`/client-dashboard/my-assessments/exam-completed?examId=${examId}&examName=${examName}`);
        });
      } catch (err) {
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
    };
  
    if (skipConfirmation) {
      submitExam();
    } else {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to submit the exam?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, submit",
        cancelButtonText: "No, continue",
        customClass: {
          confirmButton: styles['confirm-btn'],
          cancelButton: styles['cancel-btn'],
        },
      }).then((result) => {
        if (result.isConfirmed) {
          submitExam();
        }
      });
    }
  };
  

  const answeredCount = Object.keys(selectedAnswers).length;
  const isSubmitEnabled = answeredCount > 0;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6">
        {isLoading ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-center text-red-500 font-semibold">No questions in this exam.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">{examName}</h1>
              {/* <div className="text-red-500 font-bold text-lg">Time Left: {formatTime(timer)}</div> */}
              <div className="text-red-500 font-bold text-lg border border-red-500 px-4 py-1 rounded">
            Time Left: {formatTime(timer)}
          </div>
              <div className="mt-6 text-center">
         
          {/* <button
  onClick={handleSubmitExam}
  disabled={Object.keys(selectedAnswers).length === 0}
  className={`px-6 py-2 rounded shadow ${
    isSubmitEnabled ? "bg-green-500 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
  }`}
>
  Submit Exam
</button> */}

<button
      onClick={handleSubmitExam}
      disabled={!isSubmitEnabled || isSubmittingLoader} // Disable button during loading
      className={`px-6 py-2 rounded shadow flex items-center justify-center ${
        isSubmitEnabled && !isSubmittingLoader
          ? 'bg-green-500 text-white'
          : 'bg-gray-400 text-gray-700 cursor-not-allowed'
      }`}
    >
      {isSubmittingLoader ? (
        <>
          
          Submitting... 
          <span className="animate-spin border-2 border-black border-t-transparent rounded-full h-4 w-4 ml-2"></span>
        </>
      ) : (
        'Submit Exam'
      )}
    </button>
            </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {questions.length}</h2>
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

            <div className="flex justify-between mt-6">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="px-4 py-2 bg-blue-500 text-white rounded">
                Previous
              </button>
              <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="px-4 py-2 bg-blue-500 text-white rounded">
                Next
              </button>
            </div>

            

            {/* <div className="mt-4 flex justify-center space-x-2"> */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 border ${selectedAnswers[questions[index].questions[0].questionId] ? "bg-green-500 text-white" : "bg-gray-400 text-black"}`}
                  onClick={() => handleGoToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
