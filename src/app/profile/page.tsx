"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import React, { useEffect } from "react";
import { useState } from "react";
// export const metadata: Metadata = {
//   title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };






const Profile = () => {
  const [firstName, setFirstName] = useState ("");
  const [otherNames, setOtherNames] = useState ("");
  const [surName, setSurName] = useState ("");
  const [role, setRole] = useState ("");

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
         console.log(data)
         setFirstName(data.firstname)
         setOtherNames(data.othernames)
         setSurName(data.surname)
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };
    fetchClientId();
  }, []);


  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/get-role`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          console.log(data)
          setRole(data); // Assuming the role is returned in `data.role`
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  const roleLabels = {
    admin: 'ADMIN',
    client: 'CLIENT',
    super_admin: 'SUPER ADMIN',
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
               <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {firstName} {otherNames} {surName}
              </h3>
              <p className="font-medium">
                {roleLabels[role] || role}
              </p>
          
                <p className="mt-4.5">
                  Change Password
                </p>

              <div className="mx-auto max-w-180">
              <br/>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="text"
                  id="new_password"
                  // value={new_password}
                  // readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                /><br/>

<label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  type="text"
                  id="confirm_password"
                  // value={new_password}
                  // readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />

              </div><br/>
              <Link
              href="#"
              className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Change Password
            </Link>
              
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
