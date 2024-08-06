'use client';
import { useState } from "react";
import axios from "axios";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPencil, faRing, faUser, faVenusMars } from '@fortawesome/free-solid-svg-icons';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

// export const metadata: Metadata = {
//   title: "Next.js Settings | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Settings page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    othernames: "",
    gender: "",
    marital_status: "",
    Username: "",
    bio: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token'); // or however you are storing the token
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/clients`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };
  

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Register" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="firstName"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <FontAwesomeIcon icon={faUser} className="fill-current" size="lg" />
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

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="lastName"
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <FontAwesomeIcon icon={faUser} className="fill-current" size="lg" />
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="lastname"
                          id="lastname"
                          placeholder="Last Name"
                          value={formData.lastname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="lastName"
                      >
                        Othernames
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <FontAwesomeIcon icon={faUser} className="fill-current" size="lg" />
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="othernames"
                          id="lastname"
                          placeholder="Othernames"
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
      <FontAwesomeIcon icon={faVenusMars} className="fill-current" size="lg" />
    </span>
    <select
      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
      name="gender"
      id="gender"
      value={formData.gender}
      onChange={handleChange}
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
  </div>
</div>

<div className="mb-5.5">
  <label
    className="mb-3 block text-sm font-medium text-black dark:text-white"
    htmlFor="maritalStatus"
  >
    Marital Status
  </label>
  <div className="relative">
    <span className="absolute left-4.5 top-4">
      <FontAwesomeIcon icon={faRing} className="fill-current" size="lg" />
    </span>
    <select
      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
      name="marital_status"
      id="marital_status"
      value={formData.marital_status}
      onChange={handleChange}
    >
      <option value="">Select Marital Status</option>
      <option value="single">Single</option>
      <option value="married">Married</option>
      {/* Add more options as needed */}
    </select>
  </div>
</div>



                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="phoneNumber"
                    >
                      Phone Number
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="+990 3343 7865"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="Username"
                    >
                      Username
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="Username"
                      id="Username"
                      placeholder="devidjhon24"
                      value={formData.Username}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="bio"
                    >
                      BIO
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <FontAwesomeIcon icon={faPencil} className="fill-current" size="lg" />
                      </span>
                      <textarea
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="bio"
                        id="bio"
                        rows={6}
                        placeholder="Write your bio here"
                        value={formData.bio}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
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
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Register;
