"use client"
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import CardDataStats from "../CardDataStats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faBook, faBookOpen, faCartShopping, faFileInvoice, faGraduationCap, faIdBadge, faMoneyBill, faMouse, faRibbon, faScroll, faStamp, faUserGraduate, faUsers } from "@fortawesome/free-solid-svg-icons";

// Ensure that these components are needed, if not remove them


const ECommerce: React.FC = () => {
  const [clients, setClients] = useState<string>("");
  const [applications_count, setApplications] = useState<string>("");
  const [admitted_count, setAdmissions] = useState<string>("");
  const [payments_count, setPayments] = useState<string>("");
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

          setClients(data.clients);
          setApplications(data.applications_count);
          setAdmissions(data.admitted_count);
          setPayments(data.payments_count);
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardDataStats 
          title="Total Clients" 
          total={clients} 
          rate="">
            <FontAwesomeIcon
              icon={faUsers}
              className="fill-primary dark:fill-white"
              size="lg"
            />
          </CardDataStats>
          <CardDataStats
            title="Total Applications"
            total={applications_count}
            rate=""
          >
            <FontAwesomeIcon
              className="fill-primary dark:fill-white"
              icon={faMouse}
            />
          </CardDataStats>
          <CardDataStats title="Total Payments" total={payments_count} rate="">
            <FontAwesomeIcon
              icon={faCartShopping}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>
          <CardDataStats title="Admitted" total={admitted_count} rate="">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>
        </div>
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
