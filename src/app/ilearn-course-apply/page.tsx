"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const SignIn: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active courses and cohorts from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/active`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cohorts");
        }

        const data = await response.json();
        // Filter for active cohorts and map to desired format
        const activeCourses = data.cohorts
          .filter((item) => item.cohorts.status === "active")
          .map((item) => ({
            course_id: item.course_id,
            course_name: item.course_list ? item.course_list.course_name : "Unknown Course",
            cohort_id: item.cohort_id,
            cohort_name: item.cohorts.cohort_name,
            start_date: item.cohorts.start_date,
            cost: item.course_list ? item.course_list.cost : "N/A", // Handle null course_list
          }));
        setCourses(activeCourses);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black p-4">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <a href="/" className="mb-8">
          <Image
            className="hidden dark:block"
            src="/images/logo/iLearn-Africa.png"
            alt="iLearn Africa Logo"
            width={200}
            height={40}
          />
          <Image
            className="block dark:hidden"
            src="/images/logo/ilearn-logo.png"
            alt="iLearn Africa Logo"
            width={200}
            height={40}
          />
        </a>
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Explore Active Courses
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-gray-900 dark:text-gray-100">
                <thead className="bg-indigo-600 dark:bg-indigo-900 text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-sm font-semibold">Course Name</th>
                    {/* <th className="p-4 text-sm font-semibold">Cohort</th> */}
                    <th className="p-4 text-sm font-semibold">Cost</th>
                    <th className="p-4 text-sm font-semibold">Start Date</th>
                    <th className="p-4 text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <tr
                        key={`${course.course_id}-${course.cohort_id}`}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="p-4 text-sm font-medium">{course.course_name}</td>
                        {/* <td className="p-4 text-sm">{course.cohort_name}</td> */}
                        <td className="p-4 text-sm">
                          {course.cost !== "N/A" ? `₦${parseInt(course.cost).toLocaleString()}` : "N/A"}
                        </td>
                        <td className="p-4 text-sm">{course.start_date}</td>
                        <td className="p-4">
                          <Link
                            href={`/ilearn-course-payment-summary?course_id=${course.course_id}&cohort_id=${course.cohort_id}&course_name=${encodeURIComponent(course.course_name)}&cohort_name=${encodeURIComponent(course.cohort_name)}&cost=${course.cost}&start_date=${course.start_date}`}
                            className="inline-block rounded-lg bg-indigo-600 text-white py-2 px-4 text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                          >
                            Register
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No active courses available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;