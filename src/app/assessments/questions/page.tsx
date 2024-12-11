"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { MetaInformation } from "@/components/Meta";
import AssessmentsTable from "@/components/Tables/AssessmentsTable";
import AssessmentDashboard from "@/components/Tables/AssessmentDashboard";
import QuestionsTable from "@/components/Tables/QuestionsTable";
import { useSearchParams } from "next/navigation";



const TablesPage = () => {
  const searchParams = useSearchParams();
  const examName = searchParams.get('examName');
  const examId = searchParams.get('examId');
  const cohortName = searchParams.get('cohortName');
  return (
    <DefaultLayout>
   <Breadcrumb pageName={`${examName} for ${cohortName}`} />


      <div className="flex flex-col gap-10">
        <QuestionsTable/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
