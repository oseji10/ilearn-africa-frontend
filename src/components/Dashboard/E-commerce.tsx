"use client";
import dynamic from "next/dynamic";
import React from "react";
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
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Clients" total="3" 
        rate="" 
        >
    <FontAwesomeIcon icon={faUsers} className="fill-primary dark:fill-white" size="lg"/>
        </CardDataStats>
        <CardDataStats title="Total Applications" total="1" rate="" >
        <FontAwesomeIcon className="fill-primary dark:fill-white" icon={faMouse} />
        </CardDataStats>
        <CardDataStats title="Total Payments" total="1" rate="" >
      <FontAwesomeIcon icon={faCartShopping} className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats title="Certificates Issued" total="1" rate="" >
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
