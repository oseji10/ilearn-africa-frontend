import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ClientsTable from "@/components/Tables/ClientsTable";
import CoursesTable from "@/components/Tables/CoursesTable";
import { MetaInformation } from "@/components/Meta";

import AdmissionsTable from "@/components/Tables/AdmissionsTable";
import AdmittedClientsTable from "@/components/Tables/AdmittedClientsTable";
import ProcessCertificatesTable from "@/components/Tables/ProcessCertificatesTable";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Graduating Clients" />

      <div className="flex flex-col gap-10">
        <ProcessCertificatesTable/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;