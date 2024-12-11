import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";
import AssessmentsTable from "@/components/Tables/AssessmentsTable";
import AssessmentDashboard from "@/components/Tables/AssessmentDashboard";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Assessment Dashboard" />

      <div className="flex flex-col gap-10">
        {/* <AssessmentsTable/> */}
        <AssessmentDashboard/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
