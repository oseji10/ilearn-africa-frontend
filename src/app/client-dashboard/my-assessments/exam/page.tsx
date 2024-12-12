import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";

import ExamPage from "@/components/Tables/ExamPage";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Now Taking Assessment" />

      <div className="flex flex-col gap-10">
        
        <ExamPage/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
