import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";

import ExamResults from "@/components/Tables/ExamResults";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Assessment Results" />

      <div className="flex flex-col gap-10">
        <ExamResults/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
