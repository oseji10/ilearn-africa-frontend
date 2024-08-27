"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPlus, faSpinner, faTrash, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

const CoursesTable = () => {
  const [courseLists, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [centerList, setCenterList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState({
    course_id: "",
    course_name: "",
    cost: "",
    center_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modal1Ref = useRef(null);
  const modal2Ref = useRef(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    course_id2: "",
    material_type: "",
    document: "",
  });

  // Fetch center names from API
  useEffect(() => {
    const fetchCenters = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/centers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCenterList(response.data.centers); // assuming the response is an array of centers
      } catch (error) {
        console.error("Error fetching centers:", error);
      }
    };

    fetchCenters();
  }, []);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/course_list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCourses(response.data.courses);
      setFilteredCourses(response.data.courses); // Set initial filtered courses
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = courseLists.filter((course) => {
        const courseDetails = `${course.course_id || ''} ${course.course_name || ''}`.toLowerCase();
        return courseDetails.includes(searchTerm.toLowerCase());
      });
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courseLists);
    }
  }, [searchTerm, courseLists]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openModal2 = () => {
    setIsModal2Open(true);
  };

  const closeModal2 = useCallback(() => {
    setIsModal2Open(false);
  }, []);

  const handleChange = (e) => {
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
  

  const handleCourseUpload = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/course_list`,
        {
          ...selectedCourse,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCourses(); // Fetch courses again to update the table after submission
      alert("Course details submitted!");
      closeModal();
      setSelectedCourse({
        course_id: "",
        course_name: "",
        cost: "",
        center_id: "",
      });
    } catch (error) {
      console.error("Error uploading course:", error);
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const handleFileUpload = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
  
      // Create a FormData object
      const data = new FormData();
      data.append("course_id2", formData.course_id2);
      data.append("material_type", formData.material_type);
      data.append("document", formData.document); // Appending the file
  
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/course_material`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // This is important for file uploads
          },
        }
      );
  
      fetchCourses(); // Fetch courses again to update the table after submission
      alert("Course material uploaded!");
      closeModal2();
      setFormData({
        course_id2: "",
        material_type: "",
        document: "",
      });
    } catch (error) {
      console.error("Error uploading course material:", error);
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };
  

  const columns = [
    {
      name: "Course ID",
      selector: (row) => row.course_id,
      sortable: true,
    },
    {
      name: "Course Name",
      selector: (row) => row.course_name,
      sortable: true,
    },
    {
      name: "Institution",
      selector: (row) => row.centers.center_name,
      sortable: true,
    },
    {
      name: "Cost",
      selector: (row) => `NGN${Number(row.cost).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            row.status === 1
              ? "bg-success text-success"
              : row.status === 0
              ? "bg-warning text-warning"
              : ""
          }`}
        >
          {row.status === 1
            ? "Active"
            : row.status === 0
            ? "Disabled"
            : "N/A"}
        </p>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => alert(`View details for ${row.course_id}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            onClick={() => alert(`Delete ${row.course_id}`)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },
  ];

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
        <FontAwesomeIcon icon={faPlus} />&nbsp;Add New Course
      </button>
&nbsp;
      <button
        className="inline-flex items-center justify-center bg-secondary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8"
        onClick={openModal2}
      >
        <FontAwesomeIcon icon={faFilePdf} />&nbsp;Upload Course Material
      </button><br/><br/>
      <input
        type="text"
        placeholder="Search Courses"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <DataTable
        columns={columns}
        data={filteredCourses}
        pagination
        highlightOnHover
      />

      {isModalOpen && (
        <div
          ref={modal1Ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="modal-box bg-white p-4 rounded shadow-md">
            <h3 className="font-bold text-lg">Add Course</h3>
            <input
              type="text"
              name="course_id"
              placeholder="Course ID"
              value={selectedCourse.course_id}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />
            <input
              type="text"
              name="course_name"
              placeholder="Course Name"
              value={selectedCourse.course_name}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />
            <input
              type="number"
              name="cost"
              placeholder="Cost"
              value={selectedCourse.cost}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            />
            <select
              name="center_id"
              value={selectedCourse.center_id}
              onChange={handleChange}
              className="mt-2 w-full p-2 border rounded"
            >
              <option value="">Select Institution</option>
              {centerList.map((center) => (
                <option key={center.center_id} value={center.center_id}>
                  {center.center_name}
                </option>
              ))}
            </select>
            <div className="modal-action mt-4 flex justify-end">
              <button
                className="btn"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCourseUpload}
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

      {isModal2Open && (
        <div
          ref={modal2Ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="modal-box bg-white p-4 rounded shadow-md">
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
                className="btn"
                onClick={closeModal2}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
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
      )}
    </div>
  );
};

export default CoursesTable;
