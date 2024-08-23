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
  faCarTunnel,
  faCartFlatbed,
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
import { faCartArrowDown } from "@fortawesome/free-solid-svg-icons/faCartArrowDown";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons/faCartPlus";
config.autoAddCss = false;

const PaymentOptions = () => {
  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-5 xl:col-span-3">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="p-7">
            <p style={{fontSize:'20px', color:'black'}}><br/>
            Kindly choose one of the payment options below:<br/><br/>
             <a href="/client-dashboard/my-registration/courses-after-payment" style={{color:'blue'}}><FontAwesomeIcon icon={faCheckCircle} /> I Have Already Paid To iLearn Africa </a><br/>OR
<br/>
             <a style={{color:'green'}} href="/client-dashboard/courses"><FontAwesomeIcon icon={faCartPlus} /> Continue To Course Payment</a>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
