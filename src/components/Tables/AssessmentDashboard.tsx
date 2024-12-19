"use client"
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import CardDataStats from "../CardDataStats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faBook, faBookOpen, faCalendar, faCalendarAlt, faCalendarCheck, faCalendarDay, faCalendarTimes, faCalendarXmark, faCartShopping, faCheck, faFileInvoice, faGraduationCap, faIdBadge, faMoneyBill, faMouse, faRibbon, faScroll, faStamp, faUserGraduate, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons/faCalendarPlus";
import { faCalendarWeek } from "@fortawesome/free-solid-svg-icons/faCalendarWeek";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";

// Ensure that these components are needed, if not remove them
const AssessmentDashboard: React.FC = () => {
  const [clients, setClients] = useState<string>("");
  const [incomplete_applications, setIncompleteApplications] = useState<string>("");
  const [registered_clients, setRegisteredClients] = useState<string>("");
  const [pending_admissions, setPendingAdmissions] = useState<string>("");
  const [currently_admitted_clients, setCurrentlyAdmitted] = useState<string>("");
  const [all_graduated_clients, setAllGraduated] = useState<string>("");

  const [payments_today, setPaymentsToday] = useState<string>("");
  const [payments_this_week, setPaymentsThisWeek] = useState<string>("");
  const [payments_this_month, setPaymentsThisMonth] = useState<string>("");
  const [all_payments, setAllPayments] = useState<string>("");

  const [role, setRole] = useState<number | null>(null); // Changed to number or null
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  
  const [formData, setFormData] = useState({
    details: "",
    examDate: "",
    examTime: "",
    isShuffle: false,
    isRandom: false,
    canRetake: false,
    canSeeResult: false,
    status: "",
    courseId: "",
    cohortId: "",
    examName: "",
    timeAllowed: ""
  });


  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  // Fetch courses and cohorts
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [coursesResponse, cohortsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/course_list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cohorts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesResponse.data.courses);
        setCohorts(cohortsResponse.data.cohorts);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    // Fetch items from local storage
    const role = localStorage.getItem("role");
    const client = localStorage.getItem("client"); // Assume this is a JSON object as a string

    // Parse client if it exists
    let clientData = null;
    if (client) {
      clientData = JSON.parse(client);
    }

    // Check if role and client data are available in local storage
    if (role && clientData) {
      // Check if the user role is 'client' and the client status is 'profile_created'
      if (role === "client" && clientData.status === "profile_created") {
        router.push("/clients/register"); // Redirect to client registration page
      } else {
        router.push("/dashboard"); // Redirect to dashboard
      }
    } else {
      // If items are not set, handle accordingly (e.g., redirect to login)
      // router.push("/");
    }
  }, [router]);

  // return null; // This component doesn't render anything visually
// };
  
  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/statistics`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();

          setIncompleteApplications(data.incomplete_applications);
          setRegisteredClients(data.registered_clients);
          setPendingAdmissions(data.pending_admissions);
          setCurrentlyAdmitted(data.currently_admitted_clients);
          setAllGraduated(data.all_graduated_clients);

          setPaymentsToday(data.payments_today);
          setPaymentsThisWeek(data.payments_this_week);
          setPaymentsThisMonth(data.payments_this_month);
          setAllPayments(data.all_payments);


          
        } catch (error) {
          console.error("Error fetching statistics:", error);
        }
      }
    };

    fetchStatistics();
  }, []);

  useEffect(() => {
    const fetchClientId = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client-id`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setRole(Number(data.role)); // Ensure role is a number
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };

    fetchClientId();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cbt-exams`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Exam created successfully:", response.data);
      closeModal(); 
      router.push(`/assessments/all-assessments`);
      Swal.fire({
        title: "Success!",
        text: "The exam was created successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Error creating exam:", err);
      alert("Failed to create exam. Please try again.");
    }
  };

  return (
    <>
      {role === 1 && (
          <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <a onClick={openModal} href="#"><CardDataStats
            title="New Exam"
            // total={incomplete_applications}
            rate=""
          >
            <FontAwesomeIcon
              className="fill-primary dark:fill-white"
              icon={faMouse}
            />
          </CardDataStats></a>

          <a href="/assessments/all-assessments">
          <CardDataStats 
          title="All Exams" 
          // total={registered_clients} 
          rate="">
            <FontAwesomeIcon
              icon={faUsers}
              className="fill-primary dark:fill-white"
              size="lg"
            />
          </CardDataStats>
          </a>
        
          <a href="/assessments/ongoing-assessments">
          <CardDataStats 
          title="Ongoing Exams" 
          // total={currently_admitted_clients} 
          rate="">
            <FontAwesomeIcon
              icon={faUserGraduate}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>
          </a>


         <a href="/assessments/assessment-results"> 
         <CardDataStats 
         title="Exam Results" 
        //  total={pending_admissions} 
         rate=""
         >
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats></a>

        

          {/* <a href="/reports/graduated">
          <CardDataStats 
          title="Graduated Clients" 
          // total={all_graduated_clients} 
          rate="">
            <FontAwesomeIcon
              icon={faAward}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats></a> */}


{isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-11/12 md:w-1/2 max-h-[75%] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Exam</h2>
            <div className="space-y-4">
            <input
                type="text"
                name="examName"
                placeholder="Exam Name"
                value={formData.examName}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />

              <textarea
                name="details"
                placeholder="Details"
                value={formData.details}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />
              <input
                type="time"
                name="examTime"
                value={formData.examTime}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              />

<input
                type="number"
                name="timeAllowed"
                value={formData.timeAllowed}
                onChange={handleInputChange}
                placeholder="Time Allowed in Minutes e.g. (60 mins is 1hr)"
                className="border border-gray-300 rounded w-full px-4 py-2"
              />

              <div className="flex items-center space-x-2">
                <label>
                  <input
                    type="checkbox"
                    name="isShuffle"
                    checked={formData.isShuffle}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Shuffle Questions
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="isRandom"
                    checked={formData.isRandom}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Randomize Answers
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canRetake"
                    checked={formData.canRetake}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Allow Retake
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canSeeResult"
                    checked={formData.canSeeResult}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Can See Result
                </label>
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
              <select
                name="cohortId"
                value={formData.cohortId}
                onChange={handleInputChange}
                className="border border-gray-300 rounded w-full px-4 py-2"
              >
                <option value="">Select Cohort</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.cohort_id} value={cohort.cohort_id}>
                    {cohort.cohort_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Create
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-500 text-white rounded"
                style={{color: 'red'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
</>
      )}
    </>
  );
};

export default AssessmentDashboard;
