"use client"
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import CardDataStats from "../CardDataStats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faBook, faBookOpen, faCalendar, faCalendarAlt, faCalendarCheck, faCalendarDay, faCalendarTimes, faCalendarXmark, faCartShopping, faCheck, faFileInvoice, faGraduationCap, faIdBadge, faMoneyBill, faMouse, faRibbon, faScroll, faStamp, faUserGraduate, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons/faCalendarPlus";
import { faCalendarWeek } from "@fortawesome/free-solid-svg-icons/faCalendarWeek";
import { useRouter } from "next/navigation";

// Ensure that these components are needed, if not remove them
const MyAssessmentDashboard: React.FC = () => {
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
  const router = useRouter();

  useEffect(() => {
    // Fetch items from local storage
    const role = localStorage.getItem("role");
    const client = localStorage.getItem("client"); // Assume this is a JSON object as a string

    // Parse client if it exists
    let clientData = null;
    if (client) {
      clientData = JSON.parse(client);
    }

    // Check if role and client data are available in local storage
    if (role && clientData) {
      // Check if the user role is 'client' and the client status is 'profile_created'
      if (role === "client" && clientData.status === "profile_created") {
        router.push("/clients/register"); // Redirect to client registration page
      } else {
        router.push("/dashboard"); // Redirect to dashboard
      }
    } else {
      // If items are not set, handle accordingly (e.g., redirect to login)
      // router.push("/");
    }
  }, [router]);

  // return null; // This component doesn't render anything visually
// };
  
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
    
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
        <a href="/client-dashboard/my-assessments/upcoming-assessments">
          <CardDataStats 
          title="Scheduled Examination" 
          rate="">
            <FontAwesomeIcon
              icon={faUserGraduate}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats>
          </a>

         
        
     


         <a href="/client-dashboard/my-assessments/results"> 
         <CardDataStats 
         title="Exam Results" 
         rate=""
         >
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="fill-primary dark:fill-white"
            />
          </CardDataStats></a>

        </div>

    
    </>
  );
};

export default MyAssessmentDashboard;
