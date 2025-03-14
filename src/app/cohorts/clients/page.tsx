import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import CohortsClientsTable from "@/components/Tables/CohortsClientsTable";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Cohorts" />

      <div className="flex flex-col gap-10">
        <CohortsClientsTable/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
