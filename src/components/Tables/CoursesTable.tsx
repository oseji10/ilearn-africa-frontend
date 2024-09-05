"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPlus, faSpinner, faTrash, faFilePdf, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

const CoursesTable = () => {
  const [courseLists, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isCourseEditModalOpen, setIsCourseEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [centerList, setCenterList] = useState([]);
  const [selectedRow, setSelectedRow] = useState({
    course_id: "",
    course_name: "",
    cost: "",
    center_id: "",
    certification_name: "",
  })
  const [selectedCourse, setSelectedCourse] = useState({
    course_id: "",
    course_name: "",
    cost: "",
    center_id: "",
    certification_name: "",
  });

  const [selectedCourseEdit, setSelectedCourseEdit] = useState({
    course_id: "",
    course_name: "",
    cost: "",
    center_id: "",
    certification_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modal1Ref = useRef(null);
  const modal2Ref = useRef(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    course_id2: "",
    material_type: "",
    material_name: "",
    document: "",
  });

  const [selectedCourse2, setSelectedCourse2] = useState(null)
  const [selectedCourseDelete, setSelectedCourseDelete] = useState(null);

  const modalRef = useRef(null);
  const modalRef2 = useRef(null);


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

  const openCourseModal = (row) => {
    setIsCourseModalOpen(true);
    setSelectedRow(row);  // Assuming you have a state to store the selected row
  };

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

  const closeCourseModal = useCallback(() => {
    setIsCourseModalOpen(false);
  }, []);
  
  const closeCourseEditModal = useCallback(() => {
    setIsCourseEditModalOpen(false);
  }, []);
 
  const handleCourseDelete = useCallback((course) => {
    setSelectedCourseDelete(course);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCourse({
      ...selectedCourse,
      [name]: value,
    });
  };
  

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setSelectedCourseEdit({
      ...selectedCourseEdit,
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
  
  const deleteCourse = async (course) => {
    //  console.log("Client object:", client);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
  
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/delete_course/${course.course_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
         // Filter out the deleted client from the list
    setCourses(courseLists.filter((c) => c.course_id !== course.course_id));
    setFilteredCourses(filteredCourses.filter((c) => c.course_id !== course.course_id));
    setSelectedCourseDelete(null); // Close the modal
  } catch (err) {
    setError(err.message);
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
        certification_name: "",
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
      data.append("material_name", formData.material_name);
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
        material_name: "",
      });
    } catch (error) {
      console.error("Error uploading course material:", error);
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };
  
  const openEditCourseModal = (row) => {
    setSelectedCourseEdit(row);  // Set the selected course for editing
    setIsCourseEditModalOpen(true);  // Open the modal
  };

  const handleCourseUpdate = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/update_course/${selectedCourseEdit.course_id}`,
        selectedCourseEdit,  // Send the updated course data
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCourses();  // Fetch the updated courses
      alert("Course details updated!");
      closeCourseModal();  // Close the modal after update
    } catch (error) {
      console.error("Error updating course:", error);
    } finally {
      setIsSubmitting(false);
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
      selector: (row) => row.centers?.center_name,
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
        onClick={() => openEditCourseModal(row)}  // New edit button
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>

          <button
            // onClick={() => alert(`View details for ${row.course_id}`)}
            onClick={() => openCourseModal(row)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
          style={{color: 'red'}}
            // onClick={() => alert(`Delete ${row.course_id}`)}
            // onClick={() => deleteCourse(selectedCourseDelete)} 
            onClick={() => handleCourseDelete(row)}
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


{isCourseModalOpen && selectedRow && (
  <div
    ref={modal2Ref}
    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
      <h3 className="font-bold text-lg">Course Details</h3>
        <p>Course ID: <b>{selectedRow.course_id}</b></p> 
        <p>Course Name: <b>{selectedRow.certification_name}</b></p>
        <p>Certification Name: <b>{selectedRow?.course_name}</b></p>
        {/* <p>Partner Name:<b>{selectedRow?.centers.center_name}</b> </p> */}
      <div className="modal-action mt-4 flex justify-end">
        </div>
        <button
        style={{background: 'red', color:'white'}}
          className="mt-4 px-4 py-2 text-black rounded"
          onClick={closeCourseModal}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        {/* <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleCourseUpload}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            "Submit"
          )}
        </button> */}
      
    </div>
  </div>
)}


      {isModalOpen && (
        <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
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
              type="text"
              name="certification_name"
              placeholder="Certification Name"
              value={selectedCourse.certification_name}
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
                className="mt-4 px-4 py-2 text-black rounded"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
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
)}



{selectedCourseDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            ref={modalRef2}
          >
            <h2 className="text-xl font-semibold mb-4">Delete Course?</h2>
            {/* <h2 className="text-xl font-semibold mb-4">Hh{selectedCourseDelete.course_id}</h2> */}
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this course?</h3>

<button
style={{background: 'red'}}
  className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
  onClick={() => deleteCourse(selectedCourseDelete)} // Corrected this line
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



{isCourseEditModalOpen && selectedCourseEdit && (
  <div
    ref={modal2Ref}
    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div className="modal-box bg-white p-4 rounded shadow-md w-full max-w-lg md:max-w-md">
      <h3 className="font-bold text-lg">Edit Course</h3>
      <div >
      <label className=" text-sm text-black dark:text-white" >Course Name:</label>
      
        <input
          type="text"
          name="certification_name"
          value={selectedCourseEdit.certification_name}
          onChange={handleChangeEdit}
          placeholder="Certification Name"
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />

<label className=" text-sm text-black dark:text-white" >Certification Name:</label>
<input
          type="text"
          name="course_name"
          value={selectedCourseEdit.course_name}
          onChange={handleChangeEdit}
          placeholder="Course Name"
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />  
        <label className=" text-black dark:text-white"  htmlFor="cost">Cost:</label>
        <input
          type="text"
          name="cost"
          value={selectedCourseEdit.cost}
          onChange={handleChangeEdit}
          placeholder="Cost"
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />

<label className=" text-black dark:text-white"  htmlFor="center">Center:</label>
        <select
          name="center_id"
          value={selectedCourseEdit.center_id}
          onChange={handleChangeEdit}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        >
          <option value="">Select Center</option>
          {centerList.map((center) => (
            <option key={center.center_id} value={center.center_id}>
              {center.center_name}
            </option>
          ))}
        </select>
      </div>
      <div className="modal-action mt-4 flex justify-end">
      <button
          onClick={handleCourseUpdate}  // Submit edit
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Update"}
        </button>
        &nbsp;
        <button
          onClick={closeCourseEditModal}
          className="px-4 py-2 bg-gray-500 text-white rounded"
          style={{background: 'red'}}
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

export default CoursesTable;
