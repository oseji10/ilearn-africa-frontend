"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ClientsTable from "@/components/Tables/ClientsTable";
import MyRegistrationForm from "@/components/Tables/MyRegistrationForm";
import { useEffect, useState } from "react";
import RegistrationComplete from "@/components/Tables/RegistrationComplete";
import AfterRegistration from "@/components/Tables/AfterRegistration";
import CoursesAfterPayment from "@/components/Tables/MyCoursesTableAfterPayment";
import MyCoursesAfterPayment from "@/components/Tables/MyCoursesAfterPayment";
import MyCohortsTable2 from "@/components/Tables/MyCohortsTable2";

// export const metadata: Metadata = {
//   title: "iLearn Africa Registration Page",
//   // description:    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };


const RegistrationPage = () => {

  const [status, setStatus] = useState('');

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
        setStatus(data.status);
        // console.log(data.status)
        
      } catch (error) {
        console.error("Error fetching client ID:", error);
      }
    }
  };
  fetchClientId();
}, []);


  return (
    <DefaultLayout>
      <Breadcrumb pageName="Cohorts" />

      <div className="flex flex-col gap-10">
        <p>
        Please select a cohort to continue:</p>
          <MyCohortsTable2 />
          
       
      </div>
    </DefaultLayout>
  );
};

export default RegistrationPage;
