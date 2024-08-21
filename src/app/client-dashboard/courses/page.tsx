import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ClientsTable from "@/components/Tables/ClientsTable";
import CoursesTable from "@/components/Tables/CoursesTable";
import { MetaInformation } from "@/components/Meta";
import MyRegisterableCoursesTable from "@/components/Tables/MyRegisterableCoursesTable";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Available Courses" />

      <div className="flex flex-col gap-10">
        <MyRegisterableCoursesTable/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;