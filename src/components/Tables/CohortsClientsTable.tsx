"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const CohortsClientsTable = () => {
  const [cohorts, setCohorts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newCohortId, setNewCohortId] = useState("");
  const [newCourseId, setNewCourseId] = useState("");

  // Fetch Cohorts for Dropdown
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cohorts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCohorts(response.data.cohorts);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCohorts();
  }, []);

  // Fetch Clients based on Selected Cohort
  const fetchClients = async () => {
    if (!selectedCohortId) {
      alert("Please select a cohort.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cohort/${selectedCohortId}/clients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClients(response.data.clients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses when a Cohort is selected in the modal
  const fetchCoursesForCohort = async (cohortId) => {
    if (!cohortId) {
      setCourses([]); // Clear courses if no cohort is selected
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cohorts/${cohortId}/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(response.data.courses);
    } catch (err) {
      console.error("Error fetching courses:", err.message);
    }
  };

  // Open Modal and Set Selected Client Data
  const handleEditClick = (client) => {
    setSelectedClient(client);
    setNewCohortId(client.cohort_id); // Set existing cohort
    setNewCourseId(client.course_id); // Set existing course
    fetchCoursesForCohort(client.cohort_id); // Fetch courses for the client's cohort
    setShowModal(true);
  };

  // Handle Cohort Change in Modal
  const handleCohortChange = (e) => {
    const selectedCohort = e.target.value;
    setNewCohortId(selectedCohort);
    fetchCoursesForCohort(selectedCohort); // Load courses for the selected cohort
  };

  // Save Changes
  // const handleSaveChanges = async () => {
  //   if (!selectedClient) return;

  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.put(
  //       `${process.env.NEXT_PUBLIC_API_URL}/clients/${selectedClient.client_id}/update-cohort`,
  //       {
  //         cohort_id: newCohortId,
  //         course_id: newCourseId,
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     alert("Client updated successfully!");
  //     setShowModal(false);
  //     fetchClients(); // Refresh client list
  //   } catch (err) {
  //     console.error("Error updating client:", err.message);
  //   }
  // };


  const handleSaveChanges = async () => {
    if (!selectedClient) return;
  
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/${selectedClient.client_id}/update-cohort`,
        {
          old_cohort_id: selectedClient.cohort_id, // Sending old cohort
          old_course_id: selectedClient.course_id, // Sending old course
          new_cohort_id: newCohortId, // Sending new cohort
          new_course_id: newCourseId, // Sending new course
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert("Client updated successfully!");
      setShowModal(false);
      fetchClients(); // Refresh client list
    } catch (err) {
      console.error("Error updating client:", err.message);
    }
  };

  
  // Table Columns
  const columns = [
    {
      name: "Client Name",
      selector: (row) => `${row.firstname} ${row.surname} ${row.othernames}`,
      sortable: true,
    },
    { name: "Course", selector: (row) => row.course_name, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleEditClick(row)}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div>
      {/* Dropdown and Search Button */}
      <div className="mb-4 flex items-center space-x-4">
        <select
          className="px-4 py-2 border rounded shadow"
          value={selectedCohortId}
          onChange={(e) => setSelectedCohortId(e.target.value)}
        >
          <option value="">Select a Cohort</option>
          {cohorts.map((cohort) => (
            <option key={cohort.cohort_id} value={cohort.cohort_id}>
              {cohort.cohort_name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchClients}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
        >
          Search
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading clients...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <DataTable columns={columns} data={clients} pagination highlightOnHover />
      )}

      {/* Edit Modal */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">Edit Client</h2>

            {/* Cohort Selection */}
            <label className="block mb-2">Select Cohort:</label>
            <select
              className="w-full p-2 border rounded mb-4"
              value={newCohortId}
              onChange={handleCohortChange}
            >
              {cohorts.map((cohort) => (
                <option key={cohort.cohort_id} value={cohort.cohort_id}>
                  {cohort.cohort_name}
                </option>
              ))}
            </select>

            {/* Course Selection */}
            <label className="block mb-2">Select Course:</label>
            <select
              className="w-full p-2 border rounded mb-4"
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortsClientsTable;
