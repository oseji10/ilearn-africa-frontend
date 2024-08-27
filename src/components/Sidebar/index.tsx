"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAward, faBookAtlas, faBookOpen, faBuilding, faFileExport, faFileInvoiceDollar, faPen, faTableColumns, faUserGraduate, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faBoxesStacked } from "@fortawesome/free-solid-svg-icons/faBoxesStacked";
import { faBook } from "@fortawesome/free-solid-svg-icons/faBook";
import { useRouter } from "next/navigation";
import Register from "@/app/admission/register/page";
import withStatusCheck from "../withStatusCheck";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}



const adminMenu = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: (
        <FontAwesomeIcon icon={faBoxesStacked} className="fill-current" size="lg" />
        ),
        label: "Dashboard",
        route: "/dashboard",
        // children: [
        //   { label: "eCommerce", route: "/" }

        // ],
      },

      {
        icon: (
          <FontAwesomeIcon icon={faUsers} className="fill-current" size="lg" />
        ),
        label: "Clients",
        route: "/clients/clients",
        // children: [
        //   {
        //     label: "Register Client",
        //     route: "/clients/register",
        //     icon: (
        //       <FontAwesomeIcon icon={faBoxesStacked} className="fill-current" size="lg" />
        //     ),
        //   },
        //   {
        //     label: "All Clients",
        //     route: "/clients/clients",
        //     // Optionally add an icon here if needed
        //   },
        // ],
      },
      
      {
        icon: (
          <FontAwesomeIcon icon={faBuilding} className="fill-current" size="lg" />
        ),
        label: "Centers",
        route: "/centers",
      },

      {
        icon: (
          <FontAwesomeIcon icon={faBookOpen} className="fill-current" size="lg" />
        ),
        label: "Courses",
        route: "/courses",
      },

      {
        icon: (
          <FontAwesomeIcon icon={faUserGraduate} className="fill-current" size="lg" />
        ),
        label: "Admissions",
        route: "#",
        children: [
          {
            label: "Process Admission",
            route: "/admission/process-admission",
          },
          {
            label: "Admitted Clients",
            route: "/admission/admitted",
          },
          // {
          //   label: "Register Course",
          //   route: "/admission/courses",
          // },
          // {
          //   label: "Registered Courses",
          //   route: "/clients/view",
          //   // Optionally add an icon here if needed
          // },
        ],
      },


      {
        icon: (
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="fill-current" size="lg" />
        ),
        label: "Payments",
        route: "#",
        children: [
          {
            label: "Successful Payments",
            route: "/payments",
          },
          {
            label: "Pending Payments",
            route: "/payments/pending",
            // Optionally add an icon here if needed
          },
        ],
      },

      {
        icon: (
          <FontAwesomeIcon icon={faAward} className="fill-current" size="lg" />
        ),
        label: "Certificates",
        route: "#",
        children: [
          {
            label: "All Certificates",
            route: "/certificates/certificates",
          },
          {
            label: "Process Certificates",
            route: "/certificates/process-certificates",
          },
          // {
          //   label: "Upload Certificate",
          //   route: "/certificates/upload",
          //   // Optionally add an icon here if needed
          // },
        ],
      },


      {
        icon: (
          <FontAwesomeIcon icon={faFileExport} className="fill-current" size="lg" />
        ),
        label: "Reports",
        route: "#",
        children: [
          {
            label: "Applications Report",
            route: "/reports/applications",
          },
          {
            label: "Payments Report",
            route: "/reports/payments",
            // Optionally add an icon here if needed
          },
        ],
      },

     

    ],
  },
];


const clientMenu = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: (
        <FontAwesomeIcon icon={faBoxesStacked} className="fill-current" size="lg" />
        ),
        label: "Dashboard",
        route: "/dashboard",
        // children: [
        //   { label: "eCommerce", route: "/" }

        // ],
      },

      {
        icon: (
          <FontAwesomeIcon icon={faUsers} className="fill-current" size="lg" />
        ),
        label: "Update Profile",
        route: "/client-dashboard/my-registration",
        // children: [
        //   {
        //     label: "Update Profile",
        //     route: "/clients/register",
        //     icon: (
        //       <FontAwesomeIcon icon={faBoxesStacked} className="fill-current" size="lg" />
        //     ),
        //   },
    //  
        // ],
      },
      
      {
        icon: (
          <FontAwesomeIcon icon={faBookOpen} className="fill-current" size="lg" />
        ),
        label: "Courses",
        route: "",
        children: [
     
          {
            label: "Register A New Course",
            route: "/client-dashboard/my-registration/payment-options",
          },
          {
            label: "My Courses",
            route: "/client-dashboard/my-courses",
            // Optionally add an icon here if needed
          },
        ],
      },
      // {
      //   icon: (
      //     <FontAwesomeIcon icon={faUserGraduate} className="fill-current" size="lg" />
      //   ),
      //   label: "My Admissions",
      //   route: "#",

      // },


      {
        icon: (
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="fill-current" size="lg" />
        ),
        label: "My Payments",
        route: "/client-dashboard/my-payments",
        // children: [
        //   {
        //     label: "My Payments",
        //     route: "/payments",
        //   },
         
        // ],
      },

      {
        icon: (
          <FontAwesomeIcon icon={faPen} className="fill-current" size="lg" />
        ),
        label: "Assessments",
        route: "",
        children: [
     
          {
            label: "My Assessments",
            route: "",
          },
          {
            label: "Take Assessment",
            route: "",
            // Optionally add an icon here if needed
          },
        ],
      },

      {
        icon: (
          <FontAwesomeIcon icon={faAward} className="fill-current" size="lg" />
        ),
        label: "My Certificates",
        route: "/client-dashboard/my-certificates",
        
      },




   
    ],
  }
  ]
  const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const pathname = usePathname();
    const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
    const [role, setRole] = useState("");
  
    const router = useRouter();


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
            // console.log(data)
            setRole(data); // Assuming the role is returned in `data.role`
          } catch (error) {
            console.error("Error fetching user role:", error);
          }
        }
      };
  
      fetchUserRole();
    }, []);


   
  
    const menuToRender = role === "admin" ? adminMenu : clientMenu;
  
    return (
      <ClickOutside onClick={() => setSidebarOpen(false)}>
        <aside
          className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* <!-- SIDEBAR HEADER --> */}
          <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
            <Link href="/dashboard">
              <Image
                width={150}
                height={23}
                src={"/images/logo/iLearn-Africa.png"}
                alt="Logo"
                priority
              />
            </Link>
  
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              className="block lg:hidden"
            >
              <svg
                className="fill-current"
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                  fill=""
                />
              </svg>
            </button>
          </div>
          {/* <!-- SIDEBAR HEADER --> */}
  
          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            {/* <!-- Sidebar Menu --> */}
            <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
              {menuToRender.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                    {group.name}
                  </h3>
  
                  <ul className="mb-6 flex flex-col gap-1.5">
                    {group.menuItems.map((menuItem, menuIndex) => (
                      <SidebarItem
                        key={menuIndex}
                        item={menuItem}
                        pageName={pageName}
                        setPageName={setPageName}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            {/* <!-- Sidebar Menu --> */}
          </div>
        </aside>
      </ClickOutside>
    );
  };
  
  export default Sidebar;