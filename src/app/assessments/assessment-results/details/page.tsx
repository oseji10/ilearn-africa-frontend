import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";
import ExamResultsDetails from "@/components/Tables/ExamResultsDetails";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Exam Results" />

      <div className="flex flex-col gap-10">
        <ExamResultsDetails/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
