import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";
import MyAssessmentsTable from "@/components/Tables/MyAssessmentsTable";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Scheduled Exams" />

      <div className="flex flex-col gap-10">
        <MyAssessmentsTable/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
