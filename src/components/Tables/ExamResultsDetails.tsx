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
  faArrowAltCircleLeft,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";

const ExamResultsDetails = () => {
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
    examName: "",
    timeAllowed: ""
  });

  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const examName = searchParams.get("examName");

  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const router = useRouter();
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInputChange2 = (e) => {
    const { name, value, type, checked } = e.target;
    setCbtExams((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeCBTModal = () => setCBTModalOpen(false);


  
  const [cbtExams, setCbtExams] = useState([]);
  useEffect(() => {
    const fetchCbtExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-result/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCbtExams(response.data); // Update based on the actual response structure
        setFilteredCourses(response.data); // To handle filtering later
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CBT exams:", error);
        setLoading(false);
      }
    };

    fetchCbtExams();
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



  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cbt-exam-result/${row.masterId}`, {
            method: "DELETE",
          });
  
          if (!response.ok) {
            throw new Error("Failed to delete record");
          }
  
          Swal.fire("Deleted!", "The record has been deleted.", "success");
  
          // Update the state to remove the deleted item
          setCbtExams((prevExams) => prevExams.filter((exam) => exam.masterId !== row.masterId));
          setFilteredCourses((prevExams) => prevExams.filter((exam) => exam.masterId !== row.masterId));
  
        } catch (error) {
          Swal.fire("Error", "Something went wrong!", "error");
        }
      }
    });
  };
  
  
  
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
             <h4>{examName}</h4>
<span></span>


        <a href="/assessments/assessment-results"><button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          
        >
          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To Dashboard
        </button></a>
      </div>

      <DataTable
  columns={[
    // { name: "Exam Name", selector: (row) => row?.examName, sortable: true },
    {
      name: "Student Name/Id",
      selector: (row) => `${row?.firstname} ${row?.surname} ${row?.othernames ?? ''}/${row?.client_id}`, // Adjust field names as needed
      sortable: true,
      width: "40%"
  },
  
    { name: "Score", selector: (row) => row?.total_score, sortable: true },

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
    
          <a
            href={`/assessments/assessment-results/detailed-exam-results?masterId=${row.masterId}`}
            // href={`/assessments/questions?examName=${encodeURIComponent(row.examName)}&examId=${encodeURIComponent(row.examId)}&cohortName=${encodeURIComponent(row.cohort.cohort_name)}`}
            className="text-blue-500 hover:text-green-700"
          >
            <FontAwesomeIcon icon={faEye} />
          </a>

          <a
      className="text-red-500 hover:text-green-700 cursor-pointer"
      onClick={() => handleDelete(row)}
    >
      <FontAwesomeIcon icon={faTrash} />
    </a>
        </div>
      ),
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

export default ExamResultsDetails;
