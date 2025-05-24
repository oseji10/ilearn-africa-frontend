"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPlus, faSpinner, faTrash, faFilePdf, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import 'select2/dist/css/select2.min.css';
import $ from 'jquery';
import 'select2';
// import { Switch } from "@mui/material";
import {Switch} from "@nextui-org/switch";

const CohortsTable = () => {
  const [cohorts, setCohorts] = useState([]);
  const [cohortCourses, setCohortCourses] = useState([]);

  const [filteredCohorts, setFilteredCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [isCohortEditModalOpen, setIsCohortEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [isCohortCourseModalOpen, setIsCohortCourseModalOpen] = useState(false);
  const [centerList, setCenterList] = useState([]);
  const [selectedRow, setSelectedRow] = useState({
    cohort_id: "",
    cohort_name: "",
    start_date: "",
    capacity_per_class: "",

  })
  const [selectedCohort, setSelectedCohort] = useState({
    cohort_id: "",
    cohort_name: "",
    start_date: "",
    capacity_per_class: "",
    status: "",
  });

  const [selectedCohortEdit, setSelectedCohortEdit] = useState({
    cohort_id: "",
    cohort_name: "",
    start_date: "",
    capacity_per_class: "",
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modal1Ref = useRef(null);
  const modal2Ref = useRef(null);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    cohort_name: "",
    start_date: "",
    capacity_per_class: "",
    status: "",
    course_ids: [],
  });


  const [formData2, setFormData2] = useState({
    cohort_name: "",
    cohort_id: "",
    course_ids: [],
  });

  const [selectedCourse2, setSelectedCourse2] = useState(null)
  const [selectedCohortDelete, setSelectedCohortDelete] = useState(null);

  const modalRef = useRef(null);
  const modalRef2 = useRef(null);


  const fetchCohorts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data.cohorts)
      setCohorts(response.data.cohorts);
      setFilteredCohorts(response.data.cohorts); // Set initial filtered courses
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, []);


  useEffect(() => {
    if (isCohortModalOpen && selectedRow) {
      // Fetch the cohort courses when the modal opens
      fetchCohortCourses(selectedRow.cohort_id);
    }
  }, [isCohortModalOpen, selectedRow]);


  const fetchCohortCourses = async (cohortId) => {

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cohorts/${cohortId}/courses`, {
        method: 'GET', // Specify the HTTP method (optional, defaults to GET)
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // In case the API expects a JSON content type
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cohort courses'); // Handle HTTP errors
      }

      const data = await response.json();
      // console.log("hi", data.courses);
      setCohortCourses(data.courses); // Assuming the API response has a `courses` field
    } catch (error) {
      console.error('Error fetching cohort courses:', error);
    }
  };


  const selectRef = useRef(null);
  // const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    if (isCoursesModalOpen) {
      $(selectRef.current).select2({
        placeholder: "Select courses",
        allowClear: true,
      }).on('change', handleSelectChange);

      return () => {
        $(selectRef.current).select2('destroy');
      };
    }
  }, [isCoursesModalOpen]);

  // Handle select change event
  const handleSelectChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    // console.log('Selected Values:', selectedValues); // Debugging
    setSelectedCourses(selectedValues);
  };
  


  const [courseList, setCourseList] = useState([]);
const [selectedCourses, setSelectedCourses] = useState([]); // For selected course IDs

useEffect(() => {
  if (isCoursesModalOpen) {
    // Fetch course list when modal is open
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No auth token found");
    }
    const fetchCourseList = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course_list`, {
          method: 'GET', // Specify the HTTP method (optional, defaults to GET)
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // In case the API expects a JSON content type
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch course list');
        }
        const data = await response.json();
        // console.log(data)
        setCourseList(data.courses || []); // Adjust according to your API response structure
      } catch (error) {
        console.error('Error fetching course list:', error);
      }
    };

    fetchCourseList();
  }
}, [isCoursesModalOpen]);




const handleCohortCoursesUpload = async (cohort_id, course_ids) => {
 
  // console.log('Cohort ID:', cohort_id); // Debugging
  // console.log('Course IDs:', course_ids); // Debugging

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cohorts/add-cohort-courses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        cohort_id: cohort_id,
        course_ids: course_ids || [], // Use the selected course IDs
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload cohort courses');
    }

    const data = await response.json();
    // console.log(data);
    // Handle successful response
    alert("Succefully uploaded courses to this Cohort");
    closeCoursesModal();
  } catch (error) {
    console.error('Error uploading cohort courses:', error);
  }
};

  
  
  



  useEffect(() => {
    if (searchTerm) {
      const filtered = cohorts.filter((cohort) => {
        const cohortDetails = `${cohort.cohort_id || ''} ${cohort.cohort_name || ''}`.toLowerCase();
        return cohortDetails.includes(searchTerm.toLowerCase());
      });
      setFilteredCohorts(filtered);
    } else {
      setFilteredCohorts(cohorts);
    }
  }, [searchTerm, cohorts]);

  const openCohortModal = (row) => {
    setIsCohortModalOpen(true);
    setSelectedRow(row);  // Assuming you have a state to store the selected row
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openCoursesModal = (row) => {
    setSelectedCohort(row);
    setIsCoursesModalOpen(true);
  };

 

  const closeCoursesModal = useCallback(() => {
    setIsCoursesModalOpen(false);
  }, []);

  const closeCohortModal = useCallback(() => {
    setIsCohortModalOpen(false);
  }, []);

  const closeCohortEditModal = useCallback(() => {
    setIsCohortEditModalOpen(false);
  }, []);

  const handleCohortDelete = useCallback((cohort) => {
    setSelectedCohortDelete(cohort);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setSelectedCohortEdit({
      ...selectedCohortEdit,
      [name]: value,
    });
  };


  const handleChange2 = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0], // Assign the file object
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const deleteCohort = async (cohort) => {
    //  console.log("Client object:", client);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/delete-cohort/${cohort.cohort_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter out the deleted client from the list
      setCohorts(cohorts.filter((c) => c.cohort_id !== cohort.cohort_id));
      setFilteredCohorts(filteredCohorts.filter((c) => c.cohort_id !== cohort.cohort_id));
      setSelectedCohortDelete(null); // Close the modal
    } catch (err) {
      setError(err.message);
    }
  };



  const deleteCohortCourse = async (cohortId, courseId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
  
      console.log("Sending payload:", { cohort_id: cohortId, course_id: courseId }); // Debug payload
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/delete-cohort-course`,
        { cohort_id: cohortId, course_id: courseId }, // Ensure both IDs in payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("API response:", response.data); // Debug response
      alert("Course Deleted Successfully");
      setIsCohortModalOpen(false); // Close modal on success
      // Update state if needed (uncomment and adapt)
      // setCohorts(cohorts.filter((c) => c.cohort_id !== cohortId));
      // setFilteredCohorts(filteredCohorts.filter((c) => c.cohort_id !== cohortId));
    } catch (err) {
      console.error("Error deleting course:", err); // Debug error
      setError(err.message);
      alert(`Error: ${err.message}`); // Show error to user
    }
  };


  

  const handleCohortUpload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
      setIsSubmitting(true);


      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/add-cohort`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData }),
        }

      );

      if (response.ok) {
        const data = await response.json();
        // setResponse(data.message);
        alert(data.message);


        closeModal();
      } else {
        const data = await response.json();
        alert(data.message);
        fetchCohorts();
        router.refresh()
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
    setIsSubmitting(false);
  };



  const openEditCohortModal = (row) => {
    setSelectedCohortEdit(row);  // Set the selected course for editing
    setIsCohortEditModalOpen(true);  // Open the modal
  };

  const handleCohortUpdate = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/update-cohort/${selectedCohortEdit.cohort_id}`,
        selectedCohortEdit,  // Send the updated cohort  data
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCohorts();  // Fetch the updated courses
      alert("Cohort details updated!");
      closeCohortModal();  // Close the modal after update
    } catch (error) {
      console.error("Error updating cohort:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const columns = [
    {
      name: "Cohort Name",
      selector: (row) => row.cohort_name,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => row.start_date,
      sortable: true,
    },
    {
      name: "No. of Courses",
      selector: (row) => row.cohort_courses_count,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <button
          onClick={() => toggleCohortStatus(row)}  // Call the function to toggle status
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium cursor-pointer ${row.status === "active"
              ? "bg-success text-success"
              : row.status === "inactive"
                ? "bg-warning text-warning"
                : ""
            }`}
        >
          {row.status === "active"
            ? "Active"
            : row.status === "inactive"
              ? "Inactive"
              : "N/A"}
        </button>
      ),
      sortable: true,
    },
    
    // {
    //   name: "Toggle Status",
    //   cell: (row) => (
    //     <Switch 
    //     // style={{background: 'blue'}} 
    //     defaultSelected color="secondary">Primary</Switch>
    //   ),
    // },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openCoursesModal(row)}  // New edit button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
  
          <button
            onClick={() => openEditCohortModal(row)}  // New edit button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
  
          <button
            onClick={() => openCohortModal(row)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
  
          <button
            style={{ color: "white" }}
            onClick={() => handleCohortDelete(row)}
            className="px-4 py-2 bg-red text-white rounded"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },
  ];


  // Function to toggle status
  const toggleCohortStatus = async (row) => {
    const token = localStorage.getItem("token");
  
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
  
      // Send request to API to update status
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/change-cohort-status`,
        {
          cohort_id: row.cohort_id,
          status: newStatus,  // Send the toggled status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        // Use the status returned from the backend to ensure correctness
        const updatedStatus = response.data.new_status;
  
        // Update the row status with the returned value from backend
        row.status = updatedStatus;
  
        alert(`Cohort ${row.cohort_name} status updated to ${updatedStatus}`);
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating cohort status:", error);
      alert("An error occurred while updating the cohort status.");
    }
    finally{
      router.refresh()
    }
  };
  
  

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <button
        className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8"
        onClick={openModal}
      >
        <FontAwesomeIcon icon={faPlus} />&nbsp;Add New Cohort
      </button>
      &nbsp;
      {/* <button
        className="inline-flex items-center justify-center bg-secondary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8"
        onClick={openModal2}
      >
        <FontAwesomeIcon icon={faFilePdf} />&nbsp;Upload Cohort Courses
      </button> */}
      <br /><br />
      <input
        type="text"
        placeholder="Search Cohorts"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <DataTable
        columns={columns}
        data={filteredCohorts}
        pagination
        highlightOnHover
      />


      {isCohortModalOpen && selectedRow && (
        <div
          ref={modal2Ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
            <h3 className="font-bold text-lg">Cohort Details</h3>
            <p>Cohort ID: <b>{selectedRow?.cohort_id}</b></p>
            <p>Cohort Name: <b>{selectedRow?.cohort_name}</b></p>
            <p>Start Date: <b>{selectedRow?.start_date}</b></p>
            <p>Class Capacity: <b>{selectedRow?.capacity_per_class}</b></p>

            {/* List of Courses */}
            <h4 className="font-bold mt-4">Courses in this Cohort:</h4>
            {cohortCourses.length > 0 ? (
  <ul className="list-disc pl-5">
    {cohortCourses.map((course) => (
      <li key={course.course_id}>
        {course?.course_id} - {course?.course_name} |{" "}
        <a
          onClick={() => {
            const cohortId = selectedRow?.cohort_id;;
            const courseId = course?.course_id;
            console.log("Attempting to delete:", { cohortId, courseId }); // Debug IDs
            deleteCohortCourse(cohortId, courseId); // Pass both IDs
          }}
          style={{ color: "red" }}
        >
          Delete
        </a>
      </li>
    ))}
  </ul>
) : (
  <p>No courses found for this cohort.</p>
)}


            <div className="modal-action mt-4 flex justify-end">
              <button
                style={{ background: 'red', color: 'white' }}
                className="mt-4 px-4 py-2 text-black rounded"
                onClick={closeCohortModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

{isModalOpen && (
  <div
    ref={modalRef}
    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
      <h3 className="font-bold text-lg">Add New Cohort</h3>

      {/* Cohort Name */}
      <input
        type="text"
        name="cohort_name"
        placeholder="Cohort Name"
        value={formData.cohort_name}
        onChange={handleChange}
        className="mt-2 w-full p-2 border rounded"
      />

      {/* Start Date */}
      <input
        type="date"
        name="start_date"
        placeholder="Start Date"
        value={formData.start_date}
        onChange={handleChange}
        className="mt-2 w-full p-2 border rounded"
      />

      {/* Capacity Per Class */}
      <input
        type="number"
        name="capacity_per_class"
        placeholder="Capacity Per Class"
        value={formData.capacity_per_class}
        onChange={handleChange}
        className="mt-2 w-full p-2 border rounded"
      />

      {/* Checkbox for Activation */}
      <div className="mt-4 flex items-center">
        <input
          type="checkbox"
          name="status"
          value="active"
          checked={formData.status === 'active'}
          onChange={(e) => {
            const { checked } = e.target;
            setFormData((prevData) => ({
              ...prevData,
              status: checked ? 'active' : 'inactive', // Set 'active' when checked, 'inactive' when unchecked
            }));
          }}
          className="mr-2"
        />
        <label htmlFor="status">I want to activate this cohort immediately.</label>
      </div>

      {/* Modal Actions */}
      <div className="modal-action mt-4 flex justify-end">
        <button
          className="mt-4 px-4 py-2 text-black rounded"
          onClick={closeModal}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleCohortUpload}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  </div>
)}


{/* Modal Form */}
{isCoursesModalOpen && selectedCohort && (
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
          <h3 className="font-bold text-lg">Add Courses To This Cohort</h3>

          {/* Cohort Name */}
          <input
            type="text"
            name="cohort_name"
            placeholder="Cohort Name"
            value={selectedCohort.cohort_name}
            className="mt-2 w-full p-2 border rounded"
            readOnly
          />

          {/* Multi-Select for Courses with Select2 */}
          <select
            multiple
            name="course_ids"
            ref={selectRef}
            className="mt-2 w-full p-2 border rounded"
          >
            {courseList.map(course => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_id} - {course.course_name}
              </option>
            ))}
          </select>

          {/* Modal Actions */}
          <div className="modal-action mt-4 flex justify-end">
            <button
              className="mt-4 px-4 py-2 text-black rounded"
              onClick={closeCoursesModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => handleCohortCoursesUpload(selectedCohort.cohort_id, selectedCourses)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    )}



      {/* {isModal2Open && (
  <div
    ref={modal2Ref}
    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
      <h3 className="font-bold text-lg">Upload Course Material</h3>

      <select
        name="course_id2"
        value={formData.course_id2}
        onChange={handleChange2}
        className="mt-2 w-full p-2 border rounded"
      >
        <option value="">Select Course</option>
        {courseLists.map((course) => (
          <option key={course.course_id} value={course.course_id}>
            {course.course_name}
          </option>
        ))}
      </select>
      <input
              type="text"
              name="material_name"
              placeholder="Material Name"
              value={formData.material_name}
              onChange={handleChange2}
              className="mt-2 w-full p-2 border rounded"
            />
      <select
        name="material_type"
        value={formData.material_type}
        onChange={handleChange2}
        className="mt-2 w-full p-2 border rounded"
      >
        <option value="">Select Material Type</option>
        <option value="Course Material">Course Material</option>
        <option value="Brochure">Brochure</option>
      </select>

      <input
        type="file"
        name="document"
        onChange={handleChange2}
        className="mt-2 w-full p-2 border rounded"
      />

      <div className="modal-action mt-4 flex justify-end">
        <button
          // style={{color: 'black'}}
          className="mt-4 px-4 py-2 text-black rounded"
          onClick={closeModal2}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleFileUpload}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  </div>
)} */}



      {selectedCohortDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            ref={modalRef2}
          >
            <h2 className="text-xl font-semibold mb-4">Delete Cohort?</h2>
            {/* <h2 className="text-xl font-semibold mb-4">Hh{selectedCourseDelete.course_id}</h2> */}
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this cohort?</h3>

            <button
              style={{ background: 'red' }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => deleteCohort(selectedCohortDelete)} // Corrected this line
            >
              Delete
            </button>
            &nbsp;&nbsp;
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={closeModal2}
            >
              Close
            </button>
          </div>
        </div>
      )}



      {isCohortEditModalOpen && selectedCohortEdit && (
        <div
          ref={modal2Ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
            <h3 className="font-bold text-lg">Edit Cohort</h3>
            <div >
              <label className=" text-sm text-black dark:text-white" >Cohort Name:</label>

              <input
                type="text"
                name="cohort_name"
                value={selectedCohortEdit.cohort_name}
                onChange={handleChangeEdit}
                placeholder="Certification Name"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />



              <label className=" text-sm text-black dark:text-white" >Start Date:</label>
              <input
                type="date"
                name="start_date"
                value={selectedCohortEdit.start_date}
                onChange={handleChangeEdit}
                placeholder="Start Date"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />


              <label className=" text-sm text-black dark:text-white" >Capacity:</label>
              <input
                type="text"
                name="capacity_per_class"
                value={selectedCohortEdit.capacity_per_class}
                onChange={handleChangeEdit}
                placeholder="Capacity"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />

            </div>
            <div className="modal-action mt-4 flex justify-end">
              <button
                onClick={handleCohortUpdate}  // Submit edit
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Update"}
              </button>
              &nbsp;
              <button
                onClick={closeCohortEditModal}
                className="px-4 py-2 bg-gray-500 text-white rounded"
                style={{ background: 'red' }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default CohortsTable;
