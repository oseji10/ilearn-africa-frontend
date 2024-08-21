import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ClientsTable from "@/components/Tables/ClientsTable";
import MyRegistrationForm from "@/components/Tables/MyRegistrationForm";

export const metadata: Metadata = {
  title: "iLearn Africa Registration Page",
  // description:    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const RegistrationPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="My Registration Form" />

      <div className="flex flex-col gap-10">
        <MyRegistrationForm />
      </div>
    </DefaultLayout>
  );
};

export default RegistrationPage;
