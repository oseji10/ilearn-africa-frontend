import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PendingPartPaymentsTable from "@/components/Tables/PendingPartPaymentsTable";

export const metadata: Metadata = {
  title: "iLearn Africa",
  // description:    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Other Pending Payments" />

      <div className="flex flex-col gap-10">
        <PendingPartPaymentsTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
