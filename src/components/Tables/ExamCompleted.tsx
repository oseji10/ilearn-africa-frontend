"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

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

  const [error, setError] = useState(null);
  const [result, setResult] = useState("");
   // Fetch data from /api/cbt-exams
   useEffect(() => {
    const fetchResult = async () => {
      try {
        const client_id = localStorage.getItem("client_id");
        const examId = localStorage.getItem("examId");
        if (!client_id) throw new Error("Client ID not found in local storage");
  
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cbt-exam-result`, {
          client_id,
          examId, // Data sent in the request body
        });
        setResult(response.data);
        // console.log(response.data.examName);
  
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred");
      }
    };
  
    fetchResult();
  }, []);
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {/* <img
            src="/school-logo.png" // Replace with the actual path to the school's logo
            alt="School Logo"
            className="mx-auto mb-4"
          /> */}
          <h1 className="text-2xl font-bold">Congratulations {result.firstname}!</h1>
        </div>
        <div className="space-y-4">
         
          <p>You have successfully submitted this exam</p>
          <p>See details below:</p>
          <p><b>Exam Title: {result.examName}</b></p>
          <p><b>Score: {result.total_score}</b></p>
          {/* <p><b>Time Spent: {timeAllowed} minutes</b></p> */}
        </div>
        <div className="mt-6 text-center">
          <a href="/client-dashboard/my-assessments/upcoming-assessments/"><button
            className="px-6 py-2 bg-red text-white rounded shadow"
           
          >
            Close
          </button></a>
        </div>
      </div>
    </div>
  );
};

export default ExamCompleted;
