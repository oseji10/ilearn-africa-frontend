"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faPlus, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons/faFilePdf";
import { useRouter } from 'next/navigation';

const PaymentsThisMonth = () => {
  // const [courseLists, setCourses] = useState([]);
  const [filteredIncompleteApplications, setFilteredIncompleteApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDetails, setDetailsOpen] = useState(false);
  const [incompleteApplications, setIncompleteApplications] = useState([]);
  const [selectedIncompleteApplications, setSelectedIncompleteApplications] = useState({
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
  const currentlyAdmitted = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments_this_month`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data)
      setIncompleteApplications(response.data.paymentsThisMonth);
      setFilteredIncompleteApplications(response.data.paymentsThisMonth); // Set initial filtered courses
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    currentlyAdmitted();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = incompleteApplications.filter((incomplete) => {
        const incompleteApplications = `${incomplete.center_id || ''} ${incomplete.center_name || ''}`.toLowerCase();
        return incompleteApplications.includes(searchTerm.toLowerCase());
      });
      setFilteredIncompleteApplications(filtered);
    } else {
      setFilteredIncompleteApplications(incompleteApplications);
    }
  }, [searchTerm, incompleteApplications]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);


  const viewDetails = (incompleteApplications) => {
    setSelectedIncompleteApplications(incompleteApplications); // Set the selected center's details
    setDetailsOpen(true); // Open the details modal
  };

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedIncompleteApplications((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };



  const columns = [
    {
      name: "Client ID",
      selector: (row) => row.client_id,
      sortable: true,
    },
    {
      name: "Client Name",
      selector: (row) => `${row?.clients?.firstname} ${row?.clients?.othernames} ${row?.clients?.surname}`,
      sortable: true,
    },
  
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
    },

    // {
    //   name: "Status",
    //   selector: (row) => (
    //     <p
    //       className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
    //         row.status === "COMPLETED"
    //         ? "bg-success text-success"
    //           : ""
    //       }`}
    //     >
    //       {row.status === "COMPLETED"
    //         ? "GRADUATED"
    //         : "N/A"}
    //     </p>
    //   ),
    //   sortable: true,
    // },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
  onClick={() => viewDetails(row)} // Pass the entire row (center data) to viewDetails
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  <FontAwesomeIcon icon={faEye} />
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
     
      <DataTable
        columns={columns}
        data={filteredIncompleteApplications}
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
   




{openDetails && selectedIncompleteApplications &&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md bg-white rounded shadow-lg p-6 relative"
            ref={modalRef}
          >
            <h2 className="text-lg font-semibold mb-4">Client Details</h2>

           
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <b>Client ID:</b>
              </label>
              {selectedIncompleteApplications.client_id}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
               <b>Client Name:</b>
              </label>
              {selectedIncompleteApplications.clients?.firstname} {selectedIncompleteApplications.clients?.othernames} {selectedIncompleteApplications.clients?.surname}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
               <b>Email:</b>
              </label>
              {selectedIncompleteApplications.users?.email} 
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
               <b>Phone Number:</b>
              </label>
              {selectedIncompleteApplications.users?.phone_number} 
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
               <b>Course:</b>
              </label>
              {selectedIncompleteApplications.courses?.course_id} - {selectedIncompleteApplications.courses?.course_name} 
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
               <b>Amount:</b>
              </label>
              {selectedIncompleteApplications?.amount}
            </div>

            <div className="flex justify-end">
            <button
                onClick={closeDetails}
                className="mr-2 px-4 py-2 bg-gray-500 text-black rounded"
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

export default PaymentsThisMonth;
