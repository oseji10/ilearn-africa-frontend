"use client";
import React, { ChangeEvent } from "react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheck,
  faEnvelope,
  faPencil,
  faRing,
  faUser,
  faVenusMars,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const Register = () => {
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    firstname: "",
    surname: "",
    othernames: "",
    gender: "",
    marital_status: "",
    // qualification_id: "",
    // grade: "",
    // date_acquired: "",
    status: "registered",
    educationalDetails: [
      {
        qualification_id: "",
        grade: "",
        date_acquired: "",
        course_studied: "",
      },
    ],
    workDetails: [
      {
        start_date: "",
        end_date: "",
        organization: "",
        job_title: "",
      },
    ],
  });
  const [modal, setModal] = useState(false);
  const [successmodal, setSuccessModal] = useState(false);
  const router = useRouter();
  const [status, setStatus] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(100);
const [success, setSuccess] = useState("");

  const [educationalDetails, setEducationalDetails] = useState(
    formData.educationalDetails,
  );
  const [workDetails, setWorkDetails] = useState(formData.workDetails);

  const handleEducationalChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const values = [...educationalDetails];
    values[index][event.target.name] = event.target.value;
    setEducationalDetails(values);
  };

  const addEducationalDetail = () => {
    setEducationalDetails([
      ...educationalDetails,
      { qualification_id: "", grade: "", date_acquired: "", course_studied: "" },
    ]);
  };

  const handleWorkChange = (index, event) => {
    const { name, value } = event.target;
    const newWorkDetails = [...workDetails];
    newWorkDetails[index] = {
      ...newWorkDetails[index],
      [name]: value,
    };
    setWorkDetails(newWorkDetails);
  };

  const addWorkDetail = () => {
    setWorkDetails([
      ...workDetails,
      {
        start_date: "",
        end_date: "",
        organization: "",
        job_title: "",
      },
    ]);
  };

  const [grades, setGrades] = useState([]);
  useEffect(() => {
    const fetchGrades = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/grades`,
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
          setGrades(data.grades || []);
          // setQualifications(data);
          // console.log("Hi", data);
        } catch (error) {
          console.error("Error grades:", error);
        }
      }
    };

    fetchGrades();
  }, []);

  const [qualifications, setQualifications] = useState([]);
  useEffect(() => {
    const fetchQualifications = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/qualifications`,
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
          setQualifications(data.qualifications || []);
          // setQualifications(data);
          // console.log("Hi", data);
        } catch (error) {
          console.error("Error qualifications:", error);
        }
      }
    };

    fetchQualifications();
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
            },
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setFormData((prevState) => ({
            ...prevState,
            client_id: data.client_id,
            email: data.email,
            status: data.status,
            firstname: data.firstname,
            surname: data.surname,
            othernames: data.othernames,
            title: data.title,
          }));
          setStatus(data.status);
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };

    fetchClientId();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/${formData.client_id}`, // Endpoint with client_id
        {
          ...formData, // Spread formData
          educationalDetails,
          workDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setSuccessModal(true),
      setSuccess("Details updated successfully!");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message,
        setError("There was a problem updating your records. Please contact admin"),
        setModal(true),
      ), [error];
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setModal(false);
  };

  const closeSuccessModal = () => {
    setSuccessModal(false);
    router.push("/admission/courses");
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Register" />


        {successmodal && success && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-green-700 rounded-full">
     <FontAwesomeIcon icon={faCheck} size="lg" color="green"/>
        </div>
        <div className="ml-3">
          <h5 className="text-lg font-semibold">Registration Success</h5>
          <p>{success}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={closeSuccessModal} className="bg-green-700 text-white px-4 py-2 rounded-md">
          Close
        </button>
      </div>
    </div>
  </div>
)}

{modal && error && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-red-700 rounded-full">
          <FontAwesomeIcon icon={faX} size="lg" color="red"/>
        </div>
        <div className="ml-3">
          <h5 className="text-lg font-semibold">Error</h5>
          <p>{error}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  </div>
)}



 {/* PICTURE UPLOAD FORM */}
 <div className="col-span-3 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Upload Highest Qualification
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
         

                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5"> PNG, JPG or PDF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="submit"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>



          <br/>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h2 className="font-medium text-black dark:text-white">
                  PERSONAL INFORMATION
                </h2>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="clientId"
                      >
                        Client ID
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="client_id"
                          id="client_id"
                          placeholder="Client ID"
                          value={formData.client_id}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title and First Name */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="title"
                      >
                        Title
                      </label>
                      <div className="relative">
                        <select
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          name="title"
                          id="title"
                          value={formData.title}
                          onChange={handleChange}
                        >
                          <option value="">Title</option>
                          <option value="Mr">Mr.</option>
                          <option value="Mrs">Mrs.</option>
                          <option value="Miss">Ms.</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="firstname"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="fill-current"
                            size="lg"
                          />
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="firstname"
                          id="firstname"
                          placeholder="First Name"
                          value={formData.firstname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last Name and Other Names */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="lastname"
                      >
                        Surname
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="fill-current"
                            size="lg"
                          />
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="surname"
                          id="surname"
                          placeholder="Surname"
                          value={formData.surname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="othernames"
                      >
                        Other Names
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="fill-current"
                            size="lg"
                          />
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="othernames"
                          id="othernames"
                          placeholder="Other Names"
                          value={formData.othernames}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="gender"
                    >
                      Gender
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FontAwesomeIcon
                          icon={faVenusMars}
                          className="fill-current"
                          size="lg"
                        />
                      </span>
                      <select
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="gender"
                        id="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="marital_status"
                    >
                      Marital Status
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FontAwesomeIcon
                          icon={faRing}
                          className="fill-current"
                          size="lg"
                        />
                      </span>
                      <select
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="marital_status"
                        id="marital_status"
                        value={formData.marital_status}
                        onChange={handleChange}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h2 className="font-medium text-black dark:text-white">
                      EDUCATIONAL DETAILS
                    </h2>
                  </div>
                  <br />

                  {/* Educaional details*/}
                  <table>
                    <tbody>
                      {educationalDetails.map((detail, index) => (
                        <tr key={index}>
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`educationalQualification-${index}`}
                            >
                              Educational Qualification
                            </label>
                            <div className="relative">
                              <select
                                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                name="qualification_id"
                                id={`educationalQualification-${index}`}
                                value={detail.qualification_id}
                                onChange={(e) =>
                                  handleEducationalChange(index, e)
                                }
                              >
                                <option value="">
                                  Select Qualification...
                                </option>
                                {qualifications.map((qualification) => (
                                  <option
                                    key={qualification.id}
                                    value={qualification.id}
                                  >
                                    {qualification.qualification_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          &nbsp;
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`course_studied-${index}`}
                            >
                              Course Studied
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="text"
                              name="course_studied"
                              id={`course_studied-${index}`}
                              value={detail.course_studied}
                              onChange={(e) =>
                                handleEducationalChange(index, e)
                              }
                            />
                          </td>
                          &nbsp;
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`grade-${index}`}
                            >
                              Grades
                            </label>
                            <div className="relative">
                              <select
                                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                name="grade"
                                id={`grade-${index}`}
                                value={detail.grade}
                                onChange={(e) =>
                                  handleEducationalChange(index, e)
                                }
                              >
                                <option value="">Select Grade...</option>
                                {grades.map((grade) => (
                                  <option key={grade.id} value={grade.id}>
                                    {grade.grade}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          &nbsp;
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`date_acquired-${index}`}
                            >
                              Date Acquired
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="date"
                              name="date_acquired"
                              id={`date_acquired-${index}`}
                              value={detail.date_acquired}
                              onChange={(e) =>
                                handleEducationalChange(index, e)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="mt-4 rounded bg-primary px-4 py-2 text-white"
                    onClick={addEducationalDetail}
                  >
                    Add Another Educational Detail
                  </button>

                  <br />
                  <br />
                  <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h2 className="font-medium text-black dark:text-white">
                      WORK DETAILS
                    </h2>
                  </div>
                  <br />
                  {/* Work details */}
                  <table>
                    <tbody>
                      {workDetails.map((detail, index) => (
                        <tr key={index}>
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`startDate-${index}`}
                            >
                              Start Date
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="date"
                              name="start_date"
                              id={`startDate-${index}`}
                              value={detail.start_date}
                              onChange={(e) => handleWorkChange(index, e)}
                            />
                          </td>
                          &nbsp;
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`endDate-${index}`}
                            >
                              End Date
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="date"
                              name="end_date"
                              id={`endDate-${index}`}
                              value={detail.end_date}
                              onChange={(e) => handleWorkChange(index, e)}
                            />
                          </td>
                          &nbsp;
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`organization-${index}`}
                            >
                              Organization
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="text"
                              name="organization"
                              id={`organization-${index}`}
                              value={detail.organization}
                              onChange={(e) => handleWorkChange(index, e)}
                            />
                          </td>
                          &nbsp;
                          <td>
                            <label
                              className="mb-3 block text-sm font-medium text-black dark:text-white"
                              htmlFor={`jobTitle-${index}`}
                            >
                              Job Title
                            </label>
                            <input
                              className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                              type="text"
                              name="job_title"
                              id={`jobTitle-${index}`}
                              value={detail.job_title}
                              onChange={(e) => handleWorkChange(index, e)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="mt-4 rounded bg-primary px-4 py-2 text-white"
                    onClick={addWorkDetail}
                  >
                    Add Another Work Detail
                  </button>
                  <button
                    className="mt-5.5 w-full rounded bg-primary p-3 font-medium text-gray"
                    type="submit"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Register;
