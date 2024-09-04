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
import ClientCertificates from "@/components/Tables/ClientCertificates";
import SignUp from "@/components/Tables/SignUp";



const TablesPage = () => {
  return (
    // <DefaultLayout>
    //   <Breadcrumb pageName="Graduated Clients" />

      <div>
        <SignUp/>
       {/* <h1>Updating app...<a href="/auth/signin">Sign In</a></h1>  */}
      </div>
    // </DefaultLayout>
  );
};

export default TablesPage;
