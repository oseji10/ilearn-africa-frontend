"use client";
import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import ChartOne from "../Charts/ChartOne";
import ChartTwo from "../Charts/ChartTwo";
import ChatCard from "../Chat/ChatCard";
import TableOne from "../Tables/TableOne";
import CardDataStats from "../CardDataStats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faGraduationCap, faMouse, faUsers } from "@fortawesome/free-solid-svg-icons";
const MapOne = dynamic(() => import("@/components/Maps/MapOne"), {
  ssr: false,
});

const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
  ssr: false,
});

const ECommerce: React.FC = () => {
const [clients, setClients] = useState("");
const [applications_count, setApplications] = useState("");
const [admitted_count, setAdmissions] = useState("");
const [payments_count, setPayments] = useState("");

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
          // console.log("HH", data)
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
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Clients" total={clients}
        rate="" 
        >
    <FontAwesomeIcon icon={faUsers} className="fill-primary dark:fill-white" size="lg"/>
        </CardDataStats>
        <CardDataStats title="Total Applications" total={applications_count} rate="" >
        <FontAwesomeIcon className="fill-primary dark:fill-white" icon={faMouse} />
        </CardDataStats>
        <CardDataStats title="Total Payments" total={payments_count} rate="" >
      <FontAwesomeIcon icon={faCartShopping} className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats title="Admitted" total={admitted_count} rate="" >
          <FontAwesomeIcon icon={faGraduationCap} className="fill-primary dark:fill-white" />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* <ChartOne /> */}
        {/* <ChartTwo /> */}
        {/* <ChartThree /> */}
        {/* <MapOne /> */}
        <div className="col-span-12 xl:col-span-8">
          {/* <TableOne /> */}
        </div>
        {/* <ChatCard /> */}
      </div>
    </>
  );
};

export default ECommerce;
