"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const MyCoursesAfterPayment = () => {
  const [course_lists, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const modalRef = useRef(null);
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleWheel = (e) => {
    e.preventDefault();
  };

  const searchParams = useSearchParams();
  const cohortId = searchParams.get('cohort_id');

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
            },
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setClientId(data.client_id);

          setFormData((prevState) => ({
            ...prevState,
            client_id: data.client_id,
            email: data.email,
          }));
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };

    fetchClientId();
  }, []);


  // const [cohortId, setCohortId] = useState(null);
  // useEffect(() => {
  //   // Check if router is ready and query is populated
  //   if (router.query.cohort_id) {
  //     setCohortId(router.query.cohort_id);
  //   }
  // }, [router.query]);


  useEffect(() => {
    const fetchCourses = async () => {
      // Ensure cohort_id exists before making the API call
      if (!cohortId) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/my-registerable-courses/${cohortId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCourses(response.data.courses);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [cohortId]); // Trigger fetch when cohort_id is available



  const handleEyeClick = useCallback((courses) => {
    setSelectedCourse(courses);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedCourse(null);
    setFile(null); // Reset the file when closing the modal
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    if (selectedCourse) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCourse, handleClickOutside]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file); // Store the file in the state
  };


  const [partPayment, setPartPayment] = useState(0); // Initialize as needed
  const handlePaymentUpdate = useCallback(
    async (event) => {
      event.preventDefault();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);
      formData.append("course_id", selectedCourse.course_id);
      formData.append("cohort_id", cohortId);
      formData.append("part_payment", partPayment); 

      try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/proof-of-payment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          setError(null);
          closeModal();
        } else {
          throw new Error("Payment submission failed");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsSubmitting(false);
        router.push('/client-dashboard/my-payments/successful-upload');
      }
    },
    [file, clientId, partPayment, selectedCourse, closeModal, router]
  );



  const partPayments = [
   { "id": "10000", "amount": "10000" },
   { "id": "15000", "amount": "15000" },
   { "id": "20000", "amount": "20000" },
   { "id": "30000", "amount": "30000" },
   { "id": "20000", "amount": "20000" },
   { "id": "30000", "amount": "30000" },
   { "id": "50000", "amount": "50000" },
   { "id": "60000", "amount": "60000" },
   { "id": "100000", "amount": "100000" },
   { "id": "150000", "amount": "150000" },
   { "id": "200000", "amount": "200000" },
  ]
 
  // useEffect(() => {
  //   // Check if the user navigated from the previous page
  //   const fromPreviousPage = localStorage.getItem('fromPreviousPage');

  //   if (!fromPreviousPage) {
  //     // If not, redirect the user to the previous page or an error page
  //     router.push('/client-dashboard/my-registration'); // Replace with your desired redirect
  //   } else {
  //     // Clear the flag after validation
  //     sessionStorage.removeItem('fromPreviousPage');
  //   }
  // }, [router]);



  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Course ID
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Course Name
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Cost
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {course_lists.map((course_list, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {course_list.course_list.course_id}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {course_list.course_list.course_name}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      NGN{Number(course_list.course_list.cost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${course_list.status === "Paid"
                          ? "bg-warning text-warning"
                          : course_list.status === "Not Paid"
                            ? "bg-success text-success"
                            : ""
                        }`}
                    >
                      {course_list.status === "Paid"
                        ? "Registered Already"
                        : course_list.status === "Not Paid"
                          ? "Available"
                          : "N/A"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {course_list.status === "Paid"
                        ? <button
                          style={{ background: 'grey' }}
                          className="inline-flex items-center justify-center  px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                          disabled
                        >ENROLL
                        </button>
                        : course_list.status === "Not Paid"
                          ?


                          <button
                            className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                            onClick={() => handleEyeClick(course_list)}
                          >ENROLL
                          </button>

                          : "N/A"}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>




      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="relative bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Apply for {selectedCourse.course_name}
            </h2>
            <form onSubmit={handlePaymentUpdate}>
              <input
                type="text"
                name="course_id"
                value={selectedCourse.course_id}
                hidden
              />




              <div className="flex items-center justify-center">
                <input type="hidden" name="client_id" value={clientId} />
                <div className="mb-4">
                  <label
                    htmlFor="part_payment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter Amount Paid
                  </label>



                    {/* <input
                      type="number"
                      id="part_payment"
                      name="part_payment"
                      step="0.01"
                      required
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      value={partPayment} // Set the value to the state variable
                      onChange={(e) => setPartPayment(parseFloat(e.target.value) || 0)}
                    /> */}

<select
  name="part_payment"
  value={partPayment} // Maintain the selected course
  onChange={(e) =>
    setSelectedCourse((prev) => ({
      ...prev,
      partPayment: e.target.value,
    }))
  } // Update the state on change
>
  <option value="" disabled>
    Select a course
  </option>
  {partPayments.map((partPayment) => (
    <option key={partPayment.id} value={partPayment.id}>
      {partPayment.amount} {/* Replace with appropriate label */}
    </option>
  ))}
</select>

                  <br /><br />

                  <label
                    htmlFor="file"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload Payment Proof
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-primary px-6 py-3 text-white font-semibold rounded-md hover:bg-opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
            <button
              className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesAfterPayment;
