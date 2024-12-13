"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ExamCompleted = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const examName = searchParams.get('examName');
  const details = searchParams.get('details');
  const timeAllowed = searchParams.get('timeAllowed');

  const handleStartExam = () => {
    // Navigate to the exam page or start the exam logic
    router.push(`/client-dashboard/my-assessments/exam?examId=${examId}&timeAllowed=${timeAllowed}`); // Replace with actual exam page route
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {/* <img
            src="/school-logo.png" // Replace with the actual path to the school's logo
            alt="School Logo"
            className="mx-auto mb-4"
          /> */}
          <h1 className="text-2xl font-bold">Congratulation!</h1>
        </div>
        <div className="space-y-4">
         
          <p>You have successfully submitted this exam</p>
          <p>See details below:</p>
          <p><b>Title: {examName}</b></p>
          <p><b>Score: {details}</b></p>
          <p><b>Time Spent: {timeAllowed} minutes</b></p>
        </div>
        <div className="mt-6 text-center">
          <button
            className="px-6 py-2 bg-green-500 text-white rounded shadow"
            onClick={handleStartExam}
          >
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCompleted;
