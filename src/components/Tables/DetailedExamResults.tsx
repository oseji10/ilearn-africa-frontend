"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const DetailedExamResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const masterId = searchParams.get("masterId");

  const [examDetails, setExamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (masterId) {
      fetchExamDetails();
    }
  }, [masterId]);

  const fetchExamDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/detailed-exam-results/${masterId}`
      );
      console.log(response.data);
      setExamDetails(response.data);
    } catch (error) {
      setError("Failed to fetch exam details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Exam Results Details</h2>
      <div>
        <p>
          <strong>Student Name:</strong> {examDetails?.client?.firstname}{" "}
          {examDetails?.client?.surname} {examDetails?.client?.othernames}
        </p>
        <p>
          <strong>Score:</strong> {examDetails.total_score} /{" "}
          {examDetails.total_score2}
        </p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Questions & Answers</h3>
        {examDetails.exam_questions?.map((examQuestion, index) =>
          examQuestion.questions?.map((question, qIndex) => {
            // Find the selected answer for this question
            const selectedResult = examDetails.cbt_results.find(
              (result) => result.questionId === question.questionId
            );
            const selectedOptionId = selectedResult?.optionSelected;

            return (
              <div key={qIndex} className="border p-4 my-2 rounded">
                <p className="font-semibold">
                  {index + 1}. {question.question}
                </p>
                <ul className="list-disc pl-5">
                  {question.options?.map((option) => (
                    <li
                      key={option.optionId}
                      className={
                        selectedOptionId === option.optionId
                          ? option.isCorrect
                            ? "text-green-600 font-bold"
                            : "text-red font-bold"
                          : ""
                      }
                    >
                      {option.optionDetail}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">
                  <strong>Selected Answer:</strong>{" "}
                  {question.options.find(
                    (opt) => opt.optionId === selectedOptionId
                  )?.optionDetail || "Not Answered"}
                </p>
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  {question.options.find((opt) => opt.isCorrect)?.optionDetail}
                </p>
                <p>
                  <strong>Score:</strong> {selectedResult?.score ?? 0}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DetailedExamResults;
