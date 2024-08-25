"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPlus, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons/faFilePdf";
import { useRouter } from 'next/navigation';

const CentersTable = () => {
  // const [courseLists, setCourses] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [centerList, setCenterList] = useState([]);
  const [selectedCenterList, setSelectedCenterList] = useState({
    course_id: "",
    course_name: "",
    cost: "",
    center_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef(null);
  const router = useRouter();

 
  // Fetch courses
  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/centers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data)
      setCenterList(response.data.centers);
      setFilteredCenters(response.data.centers); // Set initial filtered courses
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = centerList.filter((center) => {
        const centerDetails = `${center.center_id || ''} ${center.center_name || ''}`.toLowerCase();
        return centerDetails.includes(searchTerm.toLowerCase());
      });
      setFilteredCenters(filtered);
    } else {
      setFilteredCenters(centerList);
    }
  }, [searchTerm, centerList]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCenterList((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCourseUpload = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/centers`,
        {
          ...selectedCenterList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCenters(); // Fetch courses again to update the table after submission
      alert("Course details submitted!");
      closeModal();
      setSelectedCenterList({
        center_id: "",
        center_name: "",
        // cost: "",
        // center_id: "",
      });
    } catch (error) {
      console.error("Error uploading center:", error);
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const columns = [
    {
      name: "Center",
      selector: (row) => row.center_id,
      sortable: true,
    },
    {
      name: "Center",
      selector: (row) => row.center_name,
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
        <FontAwesomeIcon icon={faPlus} />&nbsp;Add New Center
      </button>

      <br /><br />
      <DataTable
        columns={columns}
        data={filteredCenters}
        pagination
        selectableRows
        persistTableHead
        highlightOnHover
        striped
        responsive
        fixedHeader
        fixedHeaderScrollHeight="500px"
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search Courses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        }
        subHeaderAlign="right"
      />
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-1/2 bg-white rounded shadow-lg p-6 relative"
            ref={modalRef}
          >
            <h2 className="text-lg font-semibold mb-4">Center Details</h2>

            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Center ID:
              </label>
              <input
                type="text"
                name="center_id"
                value={selectedCenterList.center_id}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div> */}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Center Name:
              </label>
              <input
                type="text"
                name="center_name"
                value={selectedCenterList.center_name}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

        

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="mr-2 px-4 py-2 bg-gray-500 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCourseUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded"
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

export default CentersTable;
