import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";


import OngoingExams from "@/components/Tables/OngoingExams";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Ongoing Exams" />

      <div className="flex flex-col gap-10">
        <OngoingExams/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
