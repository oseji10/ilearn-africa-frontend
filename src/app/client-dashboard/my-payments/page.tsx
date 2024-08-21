import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ClientsTable from "@/components/Tables/ClientsTable";
import PaymentsTable from "@/components/Tables/PaymentsTable";
import MyPaymentsTable from "@/components/Tables/MyPaymentsTable";

export const metadata: Metadata = {
  title: "iLearn Africa",
  // description:    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Payments" />

      <div className="flex flex-col gap-10">
        <MyPaymentsTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
