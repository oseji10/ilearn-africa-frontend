"use client"
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import CardDataStats from "../CardDataStats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faBook, faBookOpen, faCalendar, faCalendarAlt, faCalendarCheck, faCalendarDay, faCalendarTimes, faCalendarXmark, faCartShopping, faCheck, faFileInvoice, faGraduationCap, faIdBadge, faMoneyBill, faMouse, faRibbon, faScroll, faStamp, faUserGraduate, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons/faCalendarPlus";
import { faCalendarWeek } from "@fortawesome/free-solid-svg-icons/faCalendarWeek";

// Ensure that these components are needed, if not remove them
const ECommerce: React.FC = () => {
  const [clients, setClients] = useState<string>("");
  const [incomplete_applications, setIncompleteApplications] = useState<string>("");
  const [registered_clients, setRegisteredClients] = useState<string>("");
  const [pending_admissions, setPendingAdmissions] = useState<string>("");
  const [currently_admitted_clients, setCurrentlyAdmitted] = useState<string>("");
  const [all_graduated_clients, setAllGraduated] = useState<string>("");

  const [payments_today, setPaymentsToday] = useState<string>("");
  const [payments_this_week, setPaymentsThisWeek] = useState<string>("");
  const [payments_this_month, setPaymentsThisMonth] = useState<string>("");
  const [all_payments, setAllPayments] = useState<string>("");

  const [role, setRole] = useState<number | null>(null); // Changed to number or null


  
  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/statistics`,
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

          setIncompleteApplications(data.incomplete_applications);
          setRegisteredClients(data.registered_clients);
          setPendingAdmissions(data.pending_admissions);
          setCurrentlyAdmitted(data.currently_admitted_clients);
          setAllGraduated(data.all_graduated_clients);

          setPaymentsToday(data.payments_today);
          setPaymentsThisWeek(data.payments_this_week);
          setPaymentsThisMonth(data.payments_this_month);
          setAllPayments(data.all_payments);


          
        } catch (error) {
          console.error("Error fetching statistics:", error);
        }
      }
    };

    fetchStatistics();
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
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setRole(Number(data.role)); // Ensure role is a number
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };

    fetchClientId();
  }, []);

  return (
    <>
      {role === 1 && (
          <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5 2xl:gap-7.5">
        <CardDataStats
            title="Incomplete Profiles"
            total={incomplete_applications}
            rate=""
          >
            <FontAwesomeIcon
              className="fill-primary dark:fill-white"
              icon={faMouse}
            />
          </CardDataStats>

          <CardDataStats 
          title="Total Registered Clients" 
          total={registered_clients} 
          rate="">
            <FontAwesomeIcon
              icon={faUsers}
              className="fill-primary dark:fill-white"
              size="lg"
            />
          </CardDataStats>
        
          
          <CardDataStats title="Pending Admissions" total={pending_admissions} rate="">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>

          <CardDataStats title="Currently Admitted Clients" total={currently_admitted_clients} rate="">
            <FontAwesomeIcon
              icon={faUserGraduate}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>

          <CardDataStats title="Graduated Clients" total={all_graduated_clients} rate="">
            <FontAwesomeIcon
              icon={faAward}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>
        </div>

        
<br/>

<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
<CardDataStats 
title="Verified Payments Today" 
total={payments_today} 
rate="">
  <FontAwesomeIcon
    icon={faCalendarCheck}
    className="fill-primary dark:fill-white"
    size="lg"
  />
</CardDataStats>
<CardDataStats
  title="Verified Payments This Week"
  total={payments_this_week}
  rate=""
>
  <FontAwesomeIcon
    className="fill-primary dark:fill-white"
    icon={faCalendarWeek}
  />
</CardDataStats>
<CardDataStats title="Revenue this Month" total={payments_this_month} rate="">
  <FontAwesomeIcon
    icon={faCalendarTimes}
    className="fill-primary dark:fill-white"
  />
</CardDataStats>
<CardDataStats title="Total Revenue" total={all_payments} rate="">
  <FontAwesomeIcon
    icon={faCalendarAlt}
    className="fill-primary dark:fill-white"
  />
</CardDataStats>


</div>
</>
      )}

      {role === 2 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardDataStats title="Total Clients" total={clients} rate="">
            <FontAwesomeIcon
              icon={faUsers}
              className="fill-primary dark:fill-white"
              size="lg"
            />
          </CardDataStats>
        </div>
      )}

      {role === 3 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-6 2xl:gap-7.5">
        <a href="/client-dashboard/my-courses"><CardDataStats title="My Courses" total="" rate="">
          <FontAwesomeIcon
            icon={faBookOpen}
            className="fill-primary dark:fill-white"
            size="lg"
          />
        </CardDataStats></a>

        <a href="/client-dashboard/my-payments"><CardDataStats title="My Payments" total="" rate="">
          <FontAwesomeIcon
            icon={faFileInvoice}
            className="fill-primary dark:fill-white"
            size="lg"
          />
        </CardDataStats></a>

        <a href="/client-dashboard/my-admissions"><CardDataStats title="My Admissions" total="" rate="">
          <FontAwesomeIcon
            icon={faUserGraduate}
            className="fill-primary dark:fill-white"
            size="lg"
          />
        </CardDataStats></a>

        <a href="/client-dashboard/my-certificates"><CardDataStats title="My Certificates" total="" rate="">
          <FontAwesomeIcon
            icon={faAward}
            className="fill-primary dark:fill-white"
            size="lg"
          />
        </CardDataStats></a>
      </div>
      )}

      {(role !== 1 && role !== 2 && role !== 3) && (
        <div className="text-center text-gray-500">
          <p>Details are not available for your role.</p>
        </div>
      )}
    </>
  );
};

export default ECommerce;
