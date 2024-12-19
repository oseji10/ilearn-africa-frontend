"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ExamInstructions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const examName = searchParams.get('examName');
  const details = searchParams.get('details');
  const timeAllowed = searchParams.get('timeAllowed');

  const handleStartExam = () => {
    // Navigate to the exam page or start the exam logic
    router.push(`/client-dashboard/my-assessments/exam?examId=${examId}`); // Replace with actual exam page route
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
          <h1 className="text-2xl font-bold">Exam Instructions</h1>
        </div>
        <div className="space-y-4">
          <p><b>Title: {examName}</b></p>
          <p><b>Details: {details}</b></p>
          <p><b>Time Allowed: {timeAllowed} minutes</b></p>
          <p>1. Read all questions carefully before answering.</p>
          <p>2. Ensure you have a stable internet connection.</p>
          <p>3. You cannot retake the exam unless allowed.</p>
          <p>4. The timer will start as soon as you begin.</p>
          <p>5. Any form of examinaton malpractice is highly frowned at. Please note that your exam is being monitored.</p>
          <p>6. Click "Start Exam" below when ready.</p>
        </div>
        <div className="mt-6 text-center">
          <button
            className="px-6 py-2 bg-green-500 text-white rounded shadow"
            onClick={handleStartExam}
          >
            Start Exam
          </button>
&nbsp;
          <a href="/client-dashboard/my-assessments/upcoming-assessments"><button
            className="px-6 py-2 bg-red text-white rounded shadow">
           Cancel
          </button></a>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
