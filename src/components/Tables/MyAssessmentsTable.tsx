"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faPlus,
  faSpinner,
  faTrash,
  faFilePdf,
  faEdit,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const MyAssessmentsTable = () => {
  // const [courseLists, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCBTModalOpen, setCBTModalOpen] = useState(false);
  
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
    examName: ""
  });
  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const router = useRouter();
  


  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeCBTModal = () => setCBTModalOpen(false);




  // Fetch data from /api/cbt-exams
  useEffect(() => {
    const fetchClientCohortAndExams = async () => {
      try {
        setLoading(true);
        const client_id = localStorage.getItem("client_id");
        if (!client_id) throw new Error("Client ID not found in local storage");

        const clientResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client-cohort/${client_id}`, {
          // params: { client_id },
        });

        setFilteredCourses(clientResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchClientCohortAndExams();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not Available"; // Handle null or undefined time
    }
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    const day = date.getDate();
    const ordinal =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
        ? 'rd'
        : 'th';
  
    return date.toLocaleDateString('en-US', options).replace(/\d{1,2}/, `${day}${ordinal}`);
  };
  
  const formatTime = (timeString) => {
    if (!timeString) {
      return "Not Available"; // Handle null or undefined time
    }
  
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
  
    return `${formattedHour}:${minutes}${period}`;
  };
  
  
  // Usage
 

  const handleView = (row) => {
    const date = formatDate(row?.examDate); // Convert to "Sunday, 19th January, 2024"
    const time = formatTime(row?.examTime);
    Swal.fire({
      title: "Exam Details",
      html: `
        <p><strong>Exam Name:</strong> ${row?.examName}</p>
        <p><strong>Details:</strong> ${row?.details}</p>
        <p><strong>Course:</strong> ${row?.course?.course_name}</p>
        <p><strong>Cohort:</strong> ${row?.cohort?.cohort_name}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Number of questions:</strong> N/A</p>
      `,
      confirmButtonText: "Close",
    });
  };
  


  const handleEdit = (row) => {
    setCbtExams(row);
    setCBTModalOpen(true);
  };


  
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
  <DataTable
  columns={[
    { name: "Exam Name", selector: (row) => row?.examName, sortable: true },
    { name: "Course ID", selector: (row) => row?.courseId, sortable: true },
    { name: "Course Name", selector: (row) => row?.course?.course_name, sortable: true },
    {
      name: "Exam Date",
      selector: (row) => row.examDate,
      sortable: true,
      cell: (row) => (
        <span>
          {row.examDate} at {row.examTime}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
        className={`px-2 py-1 rounded text-white ${
          row.status.trim().toLowerCase() === "active" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {row.status}
      </span>
      
      ),
    },
    {
      name: "Actions",
      cell: (row) => {
        const examDateTime = new Date(`${row.examDate}T${row.examTime}`); // Combine date & time
        const now = new Date();
    
        return (
          <div className="flex space-x-2">
            {now >= examDateTime ? (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                onClick={() =>
                  router.push(
                    `/client-dashboard/my-assessments/instructions?examId=${row.examId}&examName=${row.examName}&details=${row.details}&timeAllowed=${row.timeAllowed}`
                  )
                }
              >
                <FontAwesomeIcon icon={faPencil} /> Take Exam
              </button>
            ) : (
              <span className="text-gray-500">Not yet available</span>
            )}
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    
  ]}
  data={filteredCourses}
  pagination
  highlightOnHover
/>


    </div>
  );
};

export default MyAssessmentsTable;
