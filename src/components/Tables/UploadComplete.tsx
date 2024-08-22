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
  faCheckCircle,
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
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons/faCheckSquare";
config.autoAddCss = false;

const UploadComplete = () => {
  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-5 xl:col-span-3">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="p-7">
            <p style={{fontSize:'18px', color:'black'}}>
             
             <b>Payment proof submitted successfully.</b>👍<br/>

We will verify your payment and send you a receipt. Afterwards, we will proceed to process your admission. <br/>Your admission letter should be ready for download soon.
<br/>
<a href="/client-dashboard/my-courses" style={{color:'blue'}}><u>View registered courses</u></a>
{/* Check admission Letter */}
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadComplete;
